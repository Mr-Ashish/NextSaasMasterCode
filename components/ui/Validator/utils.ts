import { html } from 'js-beautify';

const beautifyHtml = (htmlContent: any) => {
  return html(htmlContent, {
    indent_size: 2,
    space_in_empty_paren: true,
    unformatted: [], // Keep all tags formatted
  });
};

export default beautifyHtml;
