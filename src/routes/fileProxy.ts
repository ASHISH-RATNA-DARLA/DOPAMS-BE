/**
 * fileProxy.ts
 *
 * Express route that proxies files from the Tomcat file server and
 * sets Content-Disposition: inline so the browser renders them
 * instead of downloading.
 *
 * Mount this in your Express app:
 *   import fileProxyRouter from './fileProxy';
 *   app.use('/api', fileProxyRouter);
 *
 * Then the frontend calls:
 *   GET /api/file-proxy?url=http%3A%2F%2F192.168.103.106%3A8080%2Ffiles%2Fcrimes%2F<uuid>.pdf
 */

import { Router, Request, Response } from 'express';

const router = Router();

/** Base URL of the Tomcat file server — only URLs starting with this are allowed */
const ALLOWED_FILE_BASE = process.env.FILE_SERVER_BASE_URL || 'http://192.168.103.106:8080/files/';

/** Map file extensions to MIME types for Content-Type header */
function getMimeType(filename: string): string {
  const ext = filename.split('.').pop()?.toLowerCase() ?? '';
  const mimeMap: Record<string, string> = {
    pdf: 'application/pdf',
    png: 'image/png',
    jpg: 'image/jpeg',
    jpeg: 'image/jpeg',
    gif: 'image/gif',
    webp: 'image/webp',
    txt: 'text/plain',
    csv: 'text/csv',
    doc: 'application/msword',
    docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    xls: 'application/vnd.ms-excel',
    xlsx: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  };
  return mimeMap[ext] ?? 'application/octet-stream';
}

router.get('/file-proxy', async (req: Request, res: Response): Promise<void> => {
  const fileUrl = req.query.url as string | undefined;

  // Validate URL is present
  if (!fileUrl) {
    res.status(400).json({ error: 'Missing url query parameter' });
    return;
  }

  // Security: only proxy URLs from the known Tomcat file server
  if (!fileUrl.startsWith(ALLOWED_FILE_BASE)) {
    res.status(403).json({ error: 'URL not allowed' });
    return;
  }

  try {
    const upstream = await fetch(fileUrl);

    if (!upstream.ok) {
      res.status(upstream.status).json({ error: 'File not found on file server' });
      return;
    }

    const filename = fileUrl.split('/').pop() ?? 'file';
    let contentType = upstream.headers.get('content-type');

    // Override generic binary types from Tomcat so the browser can preview them inline
    if (
      !contentType ||
      contentType.includes('application/octet-stream') ||
      contentType.includes('application/x-download')
    ) {
      contentType = getMimeType(filename);
    }

    // Key fix: override Content-Disposition to inline so browser renders the file
    res.setHeader('Content-Type', contentType);
    res.setHeader('Content-Disposition', `inline; filename="${filename}"`);
    res.setHeader('Cache-Control', 'private, max-age=3600');

    // Forward Content-Length if available (helps browser show PDF progress)
    const contentLength = upstream.headers.get('content-length');
    if (contentLength) {
      res.setHeader('Content-Length', contentLength);
    }

    // Stream the file body to the response
    const buffer = await upstream.arrayBuffer();
    res.send(Buffer.from(buffer));
    return;
  } catch (err) {
    console.error('[fileProxy] Error fetching file:', err);
    res.status(500).json({ error: 'Failed to fetch file from file server' });
    return;
  }
});

export default router;
