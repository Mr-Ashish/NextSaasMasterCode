import juice from 'juice';
import { JSDOM } from 'jsdom';
import {
  emailSupportedHtmlTags,
  allHtmlTags,
  HTMLTagsByType,
  styleAttributesCommonlyUsed,
  styleAttributesLimitedSupport,
  styleAttributesNoSupport,
} from './constants';

const { window } = new JSDOM('');

// THis is the main function that is called from the component
const transformHtml = (html: any) => {
  const traversedElements: any = [];
  const limitedSupportErrorMessages = {};
  const noSupportErrorMessages = {};

  function getInlinedStyledHtml(html: any) {
    return juice(html);
  }

  function getDocumentFromHtml(html: any) {
    const dom = new JSDOM(html);
    return dom.window.document;
  }

  // write a function which will assign a uuid as an id to each node of the html document
  // and return the document
  function assignUuidToNodes(document: any) {
    const uuid = require('uuid');
    const nodes = document.querySelectorAll('*');
    nodes.forEach((node: any) => {
      node.id = uuid.v4();
    });
    return document;
  }

  function addDefaultStylesToTable(table: any) {
    //   table.style.borderCollapse = "collapse";
    table.style.width = '100%';
    table.style.borderSpacing = 0;
    //   table.style.margin = "0";
    //   table.style.padding = "10px";
    table.style.tableLayout = 'fixed';
    //   table.style.textAlign = "center";
  }

  function returnTextInCaseOfTextNode(document: any, node: any, tbody: any) {
    if (node.nodeType === window.Node.TEXT_NODE) {
      if (node.textContent.trim() !== '') {
        //   Check if the text node is not just whitespace
        const tr = document.createElement('tr');
        const td = document.createElement('td');
        td.textContent = node.textContent.trim();
        tr.appendChild(td);
        tbody.appendChild(tr);
        //   return node.textContent.trim();
      }
    }
  }

  function convertFlexboxDivToTableStructure(document: any, div: any) {
    const table = document.createElement('table');
    const tbody = document.createElement('tbody');
    table.appendChild(tbody);
    table.style.cssText = div.style.cssText;
    addDefaultStylesToTable(table);
    div.childNodes.forEach((childNode: any) =>
      traverseAndConvert(document, childNode, tbody)
    );
    return table;
  }

  function convertGridLayoutDivToTableStructure(document: any, div: any) {
    const table = document.createElement('table');
    const tbody = document.createElement('tbody');
    table.appendChild(tbody);
    table.style.cssText = div.style.cssText;
    addDefaultStylesToTable(table);
    div.childNodes.forEach((childNode: any) =>
      traverseAndConvert(document, childNode, tbody)
    );
    return table;
  }

  function convertNormalDivToTableStructure(document: any, div: any) {
    const table = document.createElement('table');
    const tbody = document.createElement('tbody');
    table.appendChild(tbody);
    table.style.cssText = div.style.cssText;
    addDefaultStylesToTable(table);
    div.childNodes.forEach((childNode: any) =>
      traverseAndConvert(document, childNode, tbody)
    );
    return table;
  }

  // write a function which will take in an htnl node as an input whcih is of dive type
  // check if it is flexbox or not and if it is then it will convert it to a table structure
  // and return the table structure
  // if the div is of grid layout then it will convert it to a table structure and return the table structure
  // if the div is of any other type then it will return the div as it is
  // if the div is not of flexbox or grid layout then it will return the div as it is
  function convertDivToTableStructure(document: any, div: any) {
    // check if the div is flexbox or not
    const isFlexbox = div.style.display === 'flex';
    if (isFlexbox) {
      // if it is flexbox then convert it to a table structure
      return convertFlexboxDivToTableStructure(document, div);
    }

    // check if the div is grid layout or not
    const isGridLayout = div.style.display === 'grid';
    if (isGridLayout) {
      // if it is grid layout then convert it to a table structure
      return convertGridLayoutDivToTableStructure(document, div);
    }

    // if the div is not flexbox or grid layout then return the div as it is
    return convertNormalDivToTableStructure(document, div);
  }

  // write a function to check if the passed html node has more tags except TEXT inside it or not
  function hasMoreTags(node: any) {
    return node.childNodes.length > 0;
  }

  function createAnOuterTableAndStartTransversing(document: any, node: any) {
    const table = document.createElement('table');
    addDefaultStylesToTable(table);
    const tbody = document.createElement('tbody');
    table.appendChild(tbody);
    node.childNodes.forEach((childNode: any) => {
      returnTextInCaseOfTextNode(document, childNode, tbody);
      traverseAndConvert(document, childNode, tbody);
    });
    return table;
  }

  // write a function which will take in an html node as an input which is of list type
  // and for each list item it will  run the function traverseAndConvert
  function convertItemsInListToTableStructure(document: any, node: any) {
    const parentListNode = document.createElement(node.tagName.toLowerCase());
    parentListNode.style.cssText = node.style.cssText;
    node.childNodes.forEach((childNode: any) => {
      if (childNode.tagName) {
        const listNode = document.createElement(
          childNode.tagName.toLowerCase()
        );
        listNode.style.cssText = childNode.style.cssText;
        listNode.appendChild(
          createAnOuterTableAndStartTransversing(document, childNode)
        );
        parentListNode.appendChild(listNode);
      }
    });
    return parentListNode;
  }

  // write a function which will take in a table html node and loop through each row and then each cell of the table and call the function
  // traverseAndConvert for each cell
  function convertTableInputForEmail(document: any, tableNode: any) {
    // read the table
    const tbody = tableNode.querySelector('tbody');
    const rows = tbody.querySelectorAll('tr');

    // create an output table
    const outputTable = document.createElement('table');
    const outputTbody = document.createElement('tbody');
    outputTable.appendChild(outputTbody);
    rows.forEach((row: any) => {
      const outputTr = document.createElement('tr');
      row.childNodes.forEach((cell: any) => {
        if (cell.tagName) {
          const outputTd = document.createElement(cell.tagName.toLowerCase());
          // if (hasMoreTags(cell)) {
          //     outputTd.appendChild(createAnOuterTableAndStartTransversing(document, cell));
          // } else {
          outputTd.innerHTML = cell.innerHTML;
          // }
          outputTr.appendChild(outputTd);
        }
      });
      outputTbody.appendChild(outputTr);
    });
    return outputTable;
  }

  // write a function to check if the node id is traversed or not
  function isTraversed(node: any) {
    return traversedElements.includes(node.id);
  }

  function handleDivsByCreatingAnotherTableInsideTd(
    document: any,
    node: any,
    tdDiv: any
  ) {
    tdDiv.appendChild(convertDivToTableStructure(document, node));
  }

  // Traverse DOM and convert elements to table cells
  function traverseAndConvert(document: any, node: any, tbody: any) {
    if (node.nodeType === window.Node.ELEMENT_NODE && !isTraversed(node)) {
      traversedElements.push(node.id);
      const tr = document.createElement('tr');
      // Transfer styles from node to tr, if applicable
      // tr.style.cssText = node.style.cssText;
      checkNodeAttributesForWarnings(node);
      switch (node.tagName.toLowerCase()) {
        case 'h1':
        case 'h2':
        case 'h3':
        case 'h4':
        case 'h5':
        case 'h6':
          const th = document.createElement('th');
          const headingNode = document.createElement(
            node.tagName.toLowerCase()
          );
          headingNode.textContent = node.textContent;
          headingNode.style.cssText = node.style.cssText;
          // Transfer styles from node to th
          th.appendChild(headingNode);
          tr.appendChild(th);
          break;
        case 'p':
        case 'span':
          const td = document.createElement('td');
          td.textContent = node.textContent;
          // Transfer styles from node to td
          td.style.cssText = node.style.cssText;
          tr.appendChild(td);
          break;
        case 'table':
          const tdTable = document.createElement('td');
          tdTable.appendChild(convertTableInputForEmail(document, node));
          tr.appendChild(tdTable);
        case 'td':
        case 'tr':
        case 'th':
        case 'tbody':
        case 'thead':
        case 'tfoot':
          // Skip these elements as they are already being handled
          break;
        case 'br':
          // Handle line breaks by creating an empty td
          const tdBr = document.createElement('td');
          tdBr.textContent = '\u00a0'; // Non-breaking space
          // Transfer styles from node to tdBr
          tdBr.style.cssText = node.style.cssText;
          tr.appendChild(tdBr);
          break;
        case 'img':
          // Handle images by creating a td and transferring styles
          const tdImg = document.createElement('td');
          tdImg.innerHTML = node.outerHTML;
          // Transfer styles from node to tdImg
          tdImg.style.cssText = node.style.cssText;
          tr.appendChild(tdImg);
          break;
        case 'a':
          // Handle links by creating a td and transferring styles
          const tdLink = document.createElement('td');
          tdLink.innerHTML = node.outerHTML;
          // Transfer styles from node to tdLink
          tdLink.style.cssText = node.style.cssText;
          tr.appendChild(tdLink);
          break;
        case 'ul':
        case 'ol':
          // Handle lists by creating a td and transferring styles
          const tdList = document.createElement('td');
          tdList.appendChild(
            convertItemsInListToTableStructure(document, node)
          );
          tr.appendChild(tdList);
          break;
        case 'li':
          // handled in ol and ul
          break;
        case 'header':
        case 'footer':
        case 'nav':
        case 'div':
          // Handle divs by creating a td and transferring styles
          const tdDiv = document.createElement('td');
          handleDivsByCreatingAnotherTableInsideTd(document, node, tdDiv);
          // tdDiv.style.cssText = node.style.cssText;
          tr.appendChild(tdDiv);
          break;
        case 'body':
          // Skip the body element as we're already handling its children
          break;
        case 'i':
        case 'b':
        case 'em':
        case 'strong':
        case 'code':
          const tdItalic = document.createElement('td');
          tdItalic.appendChild(node);
          // Transfer styles from node to tdItalic
          // tdItalic.style.cssText = node.style.cssText;
          tr.appendChild(tdItalic);
          break;
        case 'pre':
        case 'input':
        case 'textarea':
        case 'label':
          break;
        default:
          const tdDefault = document.createElement('td');
          // Using innerHTML to preserve inner structure and styles
          tdDefault.innerHTML = node.innerHTML;
          // Transfer styles from node to tdDefault
          tdDefault.style.cssText = node.style.cssText;
          tr.appendChild(tdDefault);
          break;
      }
      tbody.appendChild(tr);

      // Recursively handle child nodes
      // Note: Child node styles are handled separately in their respective cases
      node.childNodes.forEach((childNode: any) =>
        traverseAndConvert(document, childNode, tbody)
      );
    }
  }

  function addToErrorMessages(
    messageObject: any,
    key: any,
    style: any,
    styleValue: any
  ) {
    let message = '';
    if (styleValue) {
      message = `${style}: ${styleValue}`;
    } else {
      message = style;
    }
    if (!messageObject[key]) {
      messageObject[key] = [];
    }
    if (!messageObject[key].includes(message)) {
      messageObject[key].push(message);
    }
  }

  // given a html node loop through each of the scc style attribute an call a function for each of those attributes
  function checkNodeAttributesForWarnings(node: any) {
    for (let i = 0; i < node.style.length; i++) {
      const style = node.style[i];
      const styleValue = node.style[style];
      //check if the style attribute is present in the styleAttributesCommonlyUsed object for any key of the object
      if (
        !styleAttributesCommonlyUsed.textStyles.includes(style) &&
        !styleAttributesCommonlyUsed.backgroundStyles.includes(style) &&
        !styleAttributesCommonlyUsed.boxModelStyles.includes(style) &&
        !styleAttributesCommonlyUsed.tableStyles.includes(style)
      ) {
        for (const key in styleAttributesLimitedSupport) {
          if (styleAttributesLimitedSupport[key].includes(style)) {
            addToErrorMessages(
              limitedSupportErrorMessages,
              key,
              style,
              styleValue
            );
          }
        }
        for (const key in styleAttributesNoSupport) {
          if (styleAttributesNoSupport[key].includes(style)) {
            addToErrorMessages(noSupportErrorMessages, key, style, styleValue);
          }
        }
      }
    }

    // check if the node tag is present in the emailSupportedHtmlTags array or not
    if (!emailSupportedHtmlTags.includes(node.tagName.toLowerCase())) {
      addToErrorMessages(
        noSupportErrorMessages,
        'HTML Tags',
        node.tagName.toLowerCase(),
        ''
      );
    }
  }

  function convertGivenHtmlNodeToEmailCompatibleTableStructure(
    document: any,
    node: any
  ) {
    // Create table structure
    const table = document.createElement('table');
    const tbody = document.createElement('tbody');
    table.appendChild(tbody);
    // transfer styles from node to table
    table.style.cssText = node.style.cssText;
    addDefaultStylesToTable(table);
    checkNodeAttributesForWarnings(node);
    traverseAndConvert(document, node, tbody);
    // Clear traversedElements for next conversion
    traversedElements.length = 0;
    return table;
  }

  function isValidHTML(htmlContent: any) {
    try {
      // Parse the HTML content
      const dom = new JSDOM(htmlContent);
      return true;
    } catch (error: any) {
      // Catches parsing errors indicating invalid HTML
      console.error('Invalid HTML content:', error.message);
      return false;
    }
  }

  // write a function which will wrap the passed table node and wrap it with the body and html tags
  // which is compatible with the email clients and any other tags which will make the html compatible with the email clients
  function wrapTableNodeWithHtmlAndBodyTags(document: any, tableNode: any) {
    const html = document.createElement('html');
    const body = document.createElement('body');
    const head = document.createElement('head');
    const title = document.createElement('title');
    const meta = document.createElement('meta');
    meta.setAttribute('charset', 'UTF-8');
    head.appendChild(meta);
    const meta2 = document.createElement('meta');
    meta2.setAttribute('name', 'viewport');
    meta2.setAttribute('content', 'width=device-width, initial-scale=1.0');
    head.appendChild(meta2);
    title.textContent = 'Email Template';
    head.appendChild(title);
    html.appendChild(head);
    body.appendChild(tableNode);
    html.appendChild(body);
    return html;
  }

  // calling the above util functions

  if (!isValidHTML(html)) {
    console.error('Invalid HTML provided. Please provide a valid HTML file.');
    return;
  }

  const inlineStyledHtml = getInlinedStyledHtml(html);
  const document = getDocumentFromHtml(inlineStyledHtml);
  const uuidBasedDocument = assignUuidToNodes(document);
  const body = uuidBasedDocument.body;
  const table = convertGivenHtmlNodeToEmailCompatibleTableStructure(
    document,
    body
  );
  const wrappedHtml = wrapTableNodeWithHtmlAndBodyTags(document, table);
  return {
    data: wrappedHtml.outerHTML,
    errors: { limitedSupportErrorMessages, noSupportErrorMessages },
  };
};

export default transformHtml;
