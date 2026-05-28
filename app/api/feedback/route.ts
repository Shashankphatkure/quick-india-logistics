import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { uploadToS3, presignGet, makeOrderImageKey } from '@/lib/s3';
import { randomBytes } from 'node:crypto';

export const runtime = 'nodejs';
export const maxDuration = 30;

type Kind = 'bug' | 'feature' | 'improvement' | 'question';

const KIND_META: Record<Kind, { titlePrefix: string; emoji: string; labels: string[] }> = {
  bug: { titlePrefix: 'Bug', emoji: '🐞', labels: ['bug', 'user-feedback'] },
  feature: { titlePrefix: 'Feature', emoji: '✨', labels: ['enhancement', 'user-feedback'] },
  improvement: { titlePrefix: 'Improvement', emoji: '💡', labels: ['enhancement', 'user-feedback'] },
  question: { titlePrefix: 'Question', emoji: '❓', labels: ['question', 'user-feedback'] },
};

function dataUrlToBuffer(dataUrl: string): { buffer: Buffer; mime: string } | null {
  const m = dataUrl.match(/^data:([^;]+);base64,(.+)$/);
  if (!m) return null;
  return { mime: m[1], buffer: Buffer.from(m[2], 'base64') };
}

export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const body = await request.json().catch(() => null);
    if (!body || typeof body !== 'object') {
      return NextResponse.json({ error: 'Invalid payload' }, { status: 400 });
    }

    const kind = body.kind as Kind;
    if (!['bug', 'feature', 'improvement', 'question'].includes(kind)) {
      return NextResponse.json({ error: 'Invalid kind' }, { status: 400 });
    }

    const description: string = (body.description || '').toString().trim();
    if (!description) {
      return NextResponse.json({ error: 'Description is required' }, { status: 400 });
    }

    const titleInput: string = (body.title || '').toString().trim();
    const path: string = (body.path || '').toString().slice(0, 200);
    const url: string = (body.url || '').toString().slice(0, 500);
    const userAgent: string = (body.userAgent || '').toString().slice(0, 500);
    const viewport = body.viewport && typeof body.viewport === 'object' ? body.viewport : null;
    const screenshotDataUrl: string | null =
      typeof body.screenshotDataUrl === 'string' ? body.screenshotDataUrl : null;

    // Upload screenshot to S3 if provided. Returns 7-day presigned URL (max for SigV4) so the
    // image is viewable from the GitHub issue. After 7 days the image link expires — the issue
    // body still has all the textual context.
    let screenshotUrl: string | null = null;
    if (screenshotDataUrl) {
      const decoded = dataUrlToBuffer(screenshotDataUrl);
      if (decoded) {
        const MAX_BYTES = 8 * 1024 * 1024;
        if (decoded.buffer.length > MAX_BYTES) {
          return NextResponse.json({ error: 'Screenshot too large. Max 8 MB.' }, { status: 400 });
        }
        const ext = decoded.mime.split('/')[1] || 'png';
        const rand = randomBytes(6).toString('hex');
        const key = `feedback/${session.userId}/${Date.now()}-${rand}.${ext}`;
        try {
          await uploadToS3({ key, body: decoded.buffer, contentType: decoded.mime });
          screenshotUrl = await presignGet(key, 7 * 24 * 60 * 60); // 7 days
        } catch (e) {
          console.error('Feedback screenshot upload failed:', e);
        }
      }
    }

    const meta = KIND_META[kind];
    const fallbackTitle = description.split('\n')[0].slice(0, 80) || `${meta.titlePrefix} from feedback widget`;
    const title = `${meta.emoji} [${meta.titlePrefix}] ${(titleInput || fallbackTitle).slice(0, 120)}`;

    const issueBody = [
      `> Submitted via the in-app feedback widget.`,
      ``,
      `## Description`,
      description,
      ``,
      `## Context`,
      `| Field | Value |`,
      `| --- | --- |`,
      `| **Type** | ${meta.titlePrefix} |`,
      `| **Page path** | \`${path || '—'}\` |`,
      `| **Full URL** | ${url || '—'} |`,
      `| **Reporter** | ${session.fullName} (\`${session.email ?? '—'}\`) |`,
      `| **Username** | \`${session.username}\` |`,
      `| **User ID** | \`${session.userId}\` |`,
      `| **Role** | \`${session.userType ?? 'unknown'}\` |`,
      `| **Viewport** | ${viewport ? `${viewport.w}×${viewport.h}` : '—'} |`,
      `| **User agent** | \`${userAgent || '—'}\` |`,
      `| **Submitted at** | ${new Date().toISOString()} |`,
      ``,
      screenshotUrl ? `## Screenshot\n\n![screenshot](${screenshotUrl})\n\n_Screenshot URL expires in 7 days._` : `_No screenshot attached._`,
      ``,
      `---`,
      `_Auto-filed by the QIL feedback widget._`,
    ].join('\n');

    const ghToken = process.env.GITHUB_TOKEN;
    const ghOwner = process.env.GITHUB_REPO_OWNER;
    const ghRepo = process.env.GITHUB_REPO_NAME;

    if (!ghToken || !ghOwner || !ghRepo) {
      console.error('GitHub env vars missing: GITHUB_TOKEN / GITHUB_REPO_OWNER / GITHUB_REPO_NAME');
      return NextResponse.json(
        { error: 'GitHub integration not configured. Admin must set GITHUB_TOKEN, GITHUB_REPO_OWNER, GITHUB_REPO_NAME.' },
        { status: 500 },
      );
    }

    const ghRes = await fetch(`https://api.github.com/repos/${ghOwner}/${ghRepo}/issues`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${ghToken}`,
        Accept: 'application/vnd.github+json',
        'X-GitHub-Api-Version': '2022-11-28',
        'Content-Type': 'application/json',
        'User-Agent': 'qil-feedback-widget',
      },
      body: JSON.stringify({ title, body: issueBody, labels: meta.labels }),
    });

    if (!ghRes.ok) {
      const text = await ghRes.text();
      console.error('GitHub issue creation failed:', ghRes.status, text);
      return NextResponse.json({ error: `GitHub API error: ${ghRes.status}` }, { status: 502 });
    }

    const issue = await ghRes.json();
    return NextResponse.json({
      ok: true,
      issueUrl: issue.html_url as string,
      issueNumber: issue.number as number,
      screenshotUrl,
    });
  } catch (e) {
    console.error('Feedback submission failed:', e);
    const msg = e instanceof Error ? e.message : 'Internal error';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
