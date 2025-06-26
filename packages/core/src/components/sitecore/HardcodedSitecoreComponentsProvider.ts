import { ComponentsProvider, Component } from '../index';

export class HardcodedSitecoreComponentsProvider implements ComponentsProvider {
  getComponents(): Component[] {
    return [
      {
        id: 'accordion',
        name: 'Accordion',
        description: 'Displays content in collapsible panels.',
        datasource: {
          name: 'AccordionData',
          fields: [
            { name: 'title', type: 'text' },
            { name: 'content', type: 'rte' },
          ],
        },
        placement: {
          allowedParentPlaceholders: ['main'],
          allowedChildPlaceholders: ['accordion-items'],
        },
      },
      {
        id: 'carousel',
        name: 'Carousel',
        description:
          'A slideshow for displaying images, videos, text, and links.',
        datasource: {
          name: 'CarouselData',
          fields: [
            { name: 'autoplay', type: 'checkbox' },
            { name: 'interval', type: 'number' },
          ],
        },
        placement: {
          allowedParentPlaceholders: ['main'],
          allowedChildPlaceholders: ['carousel-items'],
        },
      },
      {
        id: 'flip',
        name: 'Flip',
        description:
          'A two-sided component with a title and content on each side.',
        datasource: {
          name: 'FlipData',
          fields: [
            { name: 'frontTitle', type: 'text' },
            { name: 'frontContent', type: 'rte' },
            { name: 'backTitle', type: 'text' },
            { name: 'backContent', type: 'rte' },
          ],
        },
        placement: {
          allowedParentPlaceholders: ['main'],
          allowedChildPlaceholders: ['flip-front', 'flip-back'],
        },
      },
      {
        id: 'snippet',
        name: 'Snippet',
        description: 'Enables the creation of reusable groups of renderings.',
        datasource: {
          name: 'SnippetData',
          fields: [{ name: 'snippetId', type: 'text' }],
        },
        placement: {
          allowedParentPlaceholders: ['main'],
          allowedChildPlaceholders: ['snippet-content'],
        },
      },
      {
        id: 'tabs',
        name: 'Tabs',
        description: 'Adds tabbed content to a page.',
        datasource: {
          name: 'TabsData',
          fields: [{ name: 'selectedTab', type: 'number' }],
        },
        placement: {
          allowedParentPlaceholders: ['main'],
          allowedChildPlaceholders: ['tab-items'],
        },
      },
      {
        id: 'page-content',
        name: 'Page Content',
        description: "Shows content from the current page's data source.",
        datasource: {
          name: 'PageContentData',
          fields: [{ name: 'content', type: 'rte' }],
        },
        placement: {
          allowedParentPlaceholders: ['main'],
          allowedChildPlaceholders: [],
        },
      },
      {
        id: 'page-list',
        name: 'Page List',
        description: 'Displays lists of pages based on queries.',
        datasource: {
          name: 'PageListData',
          fields: [
            { name: 'query', type: 'text' },
            { name: 'pageSize', type: 'number' },
          ],
        },
        placement: {
          allowedParentPlaceholders: ['main'],
          allowedChildPlaceholders: [],
        },
      },
      {
        id: 'pagination',
        name: 'Pagination',
        description: 'Adds pagination for the Page List rendering.',
        datasource: {
          name: 'PaginationData',
          fields: [
            { name: 'pageSize', type: 'number' },
            { name: 'showPageNumbers', type: 'checkbox' },
          ],
        },
        placement: {
          allowedParentPlaceholders: ['main'],
          allowedChildPlaceholders: [],
        },
      },
      {
        id: 'plain-html',
        name: 'Plain HTML',
        description: 'Embeds or stores reusable HTML code.',
        datasource: {
          name: 'PlainHtmlData',
          fields: [{ name: 'html', type: 'rte' }],
        },
        placement: {
          allowedParentPlaceholders: ['main'],
          allowedChildPlaceholders: [],
        },
      },
      {
        id: 'promo',
        name: 'Promo',
        description: 'A promotional box with an icon, title, and link.',
        datasource: {
          name: 'PromoData',
          fields: [
            { name: 'title', type: 'text' },
            { name: 'text', type: 'rte' },
            { name: 'link', type: 'text' },
            { name: 'image', type: 'image' },
          ],
        },
        placement: {
          allowedParentPlaceholders: ['main'],
          allowedChildPlaceholders: [],
        },
      },
      {
        id: 'rich-text',
        name: 'Rich Text',
        description:
          'For formatted text content, which can also be stored and reused.',
        datasource: {
          name: 'RichTextContent',
          fields: [{ name: 'content', type: 'rte' }],
        },
        placement: {
          allowedParentPlaceholders: ['main'],
          allowedChildPlaceholders: [],
        },
      },
      {
        id: 'title',
        name: 'Title',
        description: 'Displays the title or subtitle of the current page.',
        datasource: {
          name: 'TitleData',
          fields: [{ name: 'text', type: 'text' }],
        },
        placement: {
          allowedParentPlaceholders: ['main'],
          allowedChildPlaceholders: [],
        },
      },
      {
        id: 'file-list',
        name: 'File List',
        description: 'Displays a list of files for download.',
        datasource: {
          name: 'FileListData',
          fields: [
            { name: 'folderPath', type: 'text' },
            {
              name: 'allowedExtensions',
              type: 'multi-select',
              options: [
                { label: 'PDF', value: '.pdf' },
                { label: 'DOCX', value: '.docx' },
              ],
            },
          ],
        },
        placement: {
          allowedParentPlaceholders: ['main'],
          allowedChildPlaceholders: [],
        },
      },
      {
        id: 'image',
        name: 'Image',
        description:
          'Displays a single image, with a reusable option available.',
        datasource: {
          name: 'Image',
          fields: [
            { name: 'src', type: 'image' },
            { name: 'alt', type: 'text' },
          ],
        },
        placement: {
          allowedParentPlaceholders: ['main'],
          allowedChildPlaceholders: [],
        },
      },
      {
        id: 'video',
        name: 'Video',
        description: 'Embeds a video.',
        datasource: {
          name: 'Video',
          fields: [
            { name: 'src', type: 'text' },
            { name: 'autoplay', type: 'checkbox' },
          ],
        },
        placement: {
          allowedParentPlaceholders: ['main'],
          allowedChildPlaceholders: [],
        },
      },
      {
        id: 'breadcrumb',
        name: 'Breadcrumb',
        description: "Shows the user's path through the site.",
        datasource: {
          name: 'BreadcrumbData',
          fields: [
            { name: 'showCurrentPage', type: 'checkbox' },
            { name: 'separator', type: 'text' },
          ],
        },
        placement: {
          allowedParentPlaceholders: ['header', 'main'],
          allowedChildPlaceholders: [],
        },
      },
      {
        id: 'link-list',
        name: 'Link List',
        description: 'Creates single or multiple links.',
        datasource: {
          name: 'LinkListData',
          fields: [
            { name: 'links', type: 'text' }, // Assuming a comma-separated list of links or similar
          ],
        },
        placement: {
          allowedParentPlaceholders: ['main'],
          allowedChildPlaceholders: [],
        },
      },
      {
        id: 'navigation',
        name: 'Navigation',
        description: 'Displays the main site navigation menu.',
        datasource: {
          name: 'NavigationData',
          fields: [
            { name: 'rootItem', type: 'text' },
            { name: 'maxDepth', type: 'number' },
          ],
        },
        placement: {
          allowedParentPlaceholders: ['header'],
          allowedChildPlaceholders: [],
        },
      },
      {
        id: 'container',
        name: 'Container',
        description: 'A container for other components.',
        placement: {
          allowedParentPlaceholders: ['main'],
          allowedChildPlaceholders: ['container-content'],
        },
      },
      {
        id: 'divider',
        name: 'Divider',
        description: 'A horizontal line to separate content.',
        placement: {
          allowedParentPlaceholders: ['main'],
          allowedChildPlaceholders: [],
        },
      },
      {
        id: 'splitter-columns',
        name: 'Splitter (Columns)',
        description: 'Divides a section into columns.',
        placement: {
          allowedParentPlaceholders: ['main'],
          allowedChildPlaceholders: ['column-1', 'column-2'],
        },
      },
      {
        id: 'splitter-rows',
        name: 'Splitter (Rows)',
        description: 'Divides a section into rows.',
        placement: {
          allowedParentPlaceholders: ['main'],
          allowedChildPlaceholders: ['row-1', 'row-2'],
        },
      },
      {
        id: 'search-box',
        name: 'Search Box',
        description: 'The main search input field.',
        datasource: {
          name: 'SearchBoxData',
          fields: [
            { name: 'placeholderText', type: 'text' },
            { name: 'searchScope', type: 'text' },
          ],
        },
        placement: {
          allowedParentPlaceholders: ['main'],
          allowedChildPlaceholders: [],
        },
      },
      {
        id: 'search-results',
        name: 'Search Results',
        description: 'Displays the search results.',
        datasource: {
          name: 'SearchResultsData',
          fields: [
            { name: 'resultsPerPage', type: 'number' },
            { name: 'noResultsText', type: 'text' },
          ],
        },
        placement: {
          allowedParentPlaceholders: ['main'],
          allowedChildPlaceholders: [],
        },
      },
      {
        id: 'language-selector',
        name: 'Language Selector',
        description:
          'Allows users to switch between different language versions of a page.',
        datasource: {
          name: 'LanguageSelectorData',
          fields: [
            {
              name: 'displayMode',
              type: 'select',
              options: [
                { label: 'Dropdown', value: 'dropdown' },
                { label: 'Links', value: 'links' },
              ],
            },
          ],
        },
        placement: {
          allowedParentPlaceholders: ['header'],
          allowedChildPlaceholders: [],
        },
      },
    ];
  }
}
