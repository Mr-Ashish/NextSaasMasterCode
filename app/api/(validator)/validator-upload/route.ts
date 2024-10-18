import { NextResponse } from 'next/server';
import DOMPurify from 'dompurify';
import { JSDOM } from 'jsdom';
import transformHtml from './utils';

export async function POST(req: any) {
  let htmlContent = null;

  // Check if the request contains formData (file upload) or JSON (html text)
  const contentType = req.headers.get('content-type');

  if (contentType.includes('multipart/form-data')) {
    // Handle file upload
    const data = await req.formData();
    const file = data.get('file');

    if (!file) {
      return NextResponse.json({ error: 'No file uploaded.' }, { status: 400 });
    }

    // Extract text from uploaded file
    htmlContent = await file.text();
  } else if (contentType.includes('application/json')) {
    // Handle HTML text upload
    const body = await req.json();
    htmlContent = body.html;

    if (!htmlContent) {
      return NextResponse.json(
        { error: 'No HTML content provided.' },
        { status: 400 }
      );
    }
  } else {
    return NextResponse.json(
      { error: 'Unsupported content type.' },
      { status: 415 }
    );
  }

  // Sanitize and transform the HTML content
  const window = new JSDOM('').window;
  const DOMPurifyInstance = DOMPurify(window);
  const sanitizedOriginal = DOMPurifyInstance.sanitize(htmlContent, {
    ALLOWED_TAGS: [
      'a',
      'b',
      'i',
      'em',
      'strong',
      'p',
      'br',
      'ul',
      'ol',
      'li',
      'span',
      'div',
      'h1',
      'h2',
      'h3',
      'h4',
      'h5',
      'h6',
      'img',
      'table',
      'tr',
      'td',
      'th',
      'tbody',
      'thead',
      'tfoot',
      'blockquote',
      'pre',
      'code',
      'style',
    ],
    ALLOWED_ATTR: [
      'href',
      'src',
      'alt',
      'title',
      'width',
      'height',
      'align',
      'style',
      'colspan',
      'rowspan',
      'target',
      'class',
      'id',
      'name',
      'type',
      'value',
    ],
    FORBID_TAGS: ['script', 'iframe', 'object', 'embed'],
    FORBID_ATTR: ['onclick', 'onerror', 'onload'],
    ALLOWED_URI_REGEXP:
      /^(?:(?:https?|mailto|tel|ftp):|[^a-z]|[a-z+.-]+(?:[^a-z]|$))/i,
  });

  const transformedHtml = transformHtml(htmlContent);
  if (!transformedHtml) {
    return NextResponse.json(
      {
        error: 'Error transforming HTML content.',
      },
      { status: 400 }
    );
  }
  // Return the transformed and sanitized HTML
  return NextResponse.json({
    transformedHtml: transformedHtml.data,
    errors: transformedHtml.errors,
    sanitizedOriginal: htmlContent,
  });
}
