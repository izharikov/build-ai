import { ComponentsProvider, Component } from '../index';

export class HardcodedSitecoreComponentsProvider implements ComponentsProvider {
    getComponents(): Promise<Component[]> {
        return Promise.resolve([
            {
                id: 'accordion',
                name: 'Accordion',
                description: 'Displays content in collapsible panels.',
                datasource: {
                    templateId: '9662acd6-3b03-4156-94fc-58f1ffdc0276',
                    name: 'AccordionData',
                    fields: [
                        { name: 'title', type: 'text' },
                        { name: 'content', type: 'html' },
                    ],
                },
                placement: {
                    allowedParentPlaceholders: [
                        '__main__',
                        'container-content',
                        'column-1',
                        'column-2',
                        'row-1',
                        'row-2',
                    ],
                    allowedChildPlaceholders: ['accordion-items'],
                },
            },
            {
                id: 'carousel',
                name: 'Carousel',
                description:
                    'A slideshow for displaying images, videos, text, and links.',
                datasource: {
                    templateId: 'e3d7ab0f-492c-4c6a-b3f4-6a84592c77f8',
                    name: 'CarouselData',
                    fields: [
                        { name: 'autoplay', type: 'checkbox' },
                        { name: 'interval', type: 'number' },
                    ],
                },
                placement: {
                    allowedParentPlaceholders: [
                        '__main__',
                        'container-content',
                        'column-1',
                        'column-2',
                        'row-1',
                        'row-2',
                    ],
                    allowedChildPlaceholders: ['carousel-items'],
                },
            },
            {
                id: 'flip',
                name: 'Flip',
                description:
                    'A two-sided component with a title and content on each side.',
                datasource: {
                    templateId: 'c1e45b3a-429d-53fe-9640-1581e24a1447',
                    name: 'FlipData',
                    fields: [
                        { name: 'frontTitle', type: 'text' },
                        { name: 'frontContent', type: 'html' },
                        { name: 'backTitle', type: 'text' },
                        { name: 'backContent', type: 'html' },
                    ],
                },
                placement: {
                    allowedParentPlaceholders: [
                        '__main__',
                        'container-content',
                        'column-1',
                        'column-2',
                        'row-1',
                        'row-2',
                    ],
                    allowedChildPlaceholders: ['flip-front', 'flip-back'],
                },
            },
            {
                id: 'snippet',
                name: 'Snippet',
                description:
                    'Enables the creation of reusable groups of renderings.',
                datasource: {
                    templateId: '9b5e1e18-fd8d-5e80-8028-861d007dca15',
                    name: 'SnippetData',
                    fields: [{ name: 'snippetId', type: 'text' }],
                },
                placement: {
                    allowedParentPlaceholders: [
                        '__main__',
                        'container-content',
                        'column-1',
                        'column-2',
                        'row-1',
                        'row-2',
                    ],
                    allowedChildPlaceholders: ['snippet-content'],
                },
            },
            {
                id: 'tabs',
                name: 'Tabs',
                description: 'Adds tabbed content to a page.',
                datasource: {
                    templateId: '2f9d05fd-8e58-56ccb-5864-1a3ec155cd7e',
                    name: 'TabsData',
                    fields: [{ name: 'selectedTab', type: 'number' }],
                },
                placement: {
                    allowedParentPlaceholders: [
                        '__main__',
                        'container-content',
                        'column-1',
                        'column-2',
                        'row-1',
                        'row-2',
                    ],
                    allowedChildPlaceholders: ['tab-items'],
                },
            },
            {
                id: 'page-content',
                name: 'Page Content',
                description:
                    "Shows content from the current page's data source.",
                datasource: {
                    templateId: '42ed34a8-7b82-4bd1-8a53-1fe94c0a35e0',
                    name: 'PageContentData',
                    fields: [{ name: 'content', type: 'html' }],
                },
                placement: {
                    allowedParentPlaceholders: [
                        '__main__',
                        'container-content',
                        'column-1',
                        'column-2',
                        'row-1',
                        'row-2',
                        'accordion-items',
                        'carousel-items',
                        'tab-items',
                        'flip-front',
                        'flip-back',
                        'snippet-content',
                    ],
                    allowedChildPlaceholders: [],
                },
            },
            {
                id: 'page-list',
                name: 'Page List',
                description: 'Displays lists of pages based on queries.',
                datasource: {
                    templateId: 'd7018d1c-2c3e-3ae6-8b65-1e4e5d2c0b7c',
                    name: 'PageListData',
                    fields: [
                        { name: 'query', type: 'text' },
                        { name: 'pageSize', type: 'number' },
                    ],
                },
                placement: {
                    allowedParentPlaceholders: [
                        '__main__',
                        'container-content',
                        'column-1',
                        'column-2',
                        'row-1',
                        'row-2',
                    ],
                    allowedChildPlaceholders: [],
                },
            },
            {
                id: 'pagination',
                name: 'Pagination',
                description: 'Adds pagination for the Page List rendering.',
                datasource: {
                    templateId: 'cb6faee6-2a2d-5262-80b6-1e751d2c9639',
                    name: 'PaginationData',
                    fields: [
                        { name: 'pageSize', type: 'number' },
                        { name: 'showPageNumbers', type: 'checkbox' },
                    ],
                },
                placement: {
                    allowedParentPlaceholders: [
                        '__main__',
                        'container-content',
                        'column-1',
                        'column-2',
                        'row-1',
                        'row-2',
                    ],
                    allowedChildPlaceholders: [],
                },
            },
            {
                id: 'plain-html',
                name: 'Plain HTML',
                description: 'Embeds or stores reusable HTML code.',
                datasource: {
                    templateId: '4be56f57-7867-5e91-8991-37464315d86b',
                    name: 'PlainHtmlData',
                    fields: [{ name: 'html', type: 'html' }],
                },
                placement: {
                    allowedParentPlaceholders: [
                        '__main__',
                        'container-content',
                        'column-1',
                        'column-2',
                        'row-1',
                        'row-2',
                        'accordion-items',
                        'carousel-items',
                        'tab-items',
                        'flip-front',
                        'flip-back',
                        'snippet-content',
                    ],
                    allowedChildPlaceholders: [],
                },
            },
            {
                id: 'promo',
                name: 'Promo',
                description: 'A promotional box with an icon, title, and link.',
                datasource: {
                    templateId: '279a5772-adfa-5260-88e6-1b61601b5128',
                    name: 'PromoData',
                    fields: [
                        { name: 'title', type: 'text' },
                        { name: 'text', type: 'html' },
                        { name: 'link', type: 'text' },
                        { name: 'image', type: 'image' },
                    ],
                },
                placement: {
                    allowedParentPlaceholders: [
                        '__main__',
                        'container-content',
                        'column-1',
                        'column-2',
                        'row-1',
                        'row-2',
                        'accordion-items',
                        'carousel-items',
                        'tab-items',
                        'flip-front',
                        'flip-back',
                        'snippet-content',
                    ],
                    allowedChildPlaceholders: [],
                },
            },
            {
                id: 'rich-text',
                name: 'Rich Text',
                description:
                    'For formatted text content, which can also be stored and reused.',
                datasource: {
                    templateId: '298d16e7-cfb2-5b7f-93c2-d9e6f6a85b62',
                    name: 'RichTextContent',
                    fields: [{ name: 'content', type: 'html' }],
                },
                placement: {
                    allowedParentPlaceholders: [
                        '__main__',
                        'container-content',
                        'column-1',
                        'column-2',
                        'row-1',
                        'row-2',
                        'accordion-items',
                        'carousel-items',
                        'tab-items',
                        'flip-front',
                        'flip-back',
                        'snippet-content',
                    ],
                    allowedChildPlaceholders: [],
                },
            },
            {
                id: 'title',
                name: 'Title',
                description:
                    'Displays the title or subtitle of the current page.',
                datasource: {
                    templateId: '7a1d9a21-b8d7-5b9c-a1b2-d2f1d0e6a2a8',
                    name: 'TitleData',
                    fields: [{ name: 'text', type: 'text' }],
                },
                placement: {
                    allowedParentPlaceholders: [
                        '__main__',
                        'container-content',
                        'column-1',
                        'column-2',
                        'row-1',
                        'row-2',
                        'accordion-items',
                        'carousel-items',
                        'tab-items',
                        'flip-front',
                        'flip-back',
                        'snippet-content',
                    ],
                    allowedChildPlaceholders: [],
                },
            },
            {
                id: 'file-list',
                name: 'File List',
                description: 'Displays a list of files for download.',
                datasource: {
                    templateId: 'b00b0079-2faf-4bfa-af3c-4e98ef164c9f',
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
                    allowedParentPlaceholders: [
                        '__main__',
                        'container-content',
                        'column-1',
                        'column-2',
                        'row-1',
                        'row-2',
                    ],
                    allowedChildPlaceholders: [],
                },
            },
            {
                id: 'image',
                name: 'Image',
                description:
                    'Displays a single image, with a reusable option available.',
                datasource: {
                    templateId: 'dc5b6248-ad97-440a-a3ff-d3b6248ad974',
                    name: 'Image',
                    fields: [
                        { name: 'src', type: 'image' },
                        { name: 'alt', type: 'text' },
                    ],
                },
                placement: {
                    allowedParentPlaceholders: [
                        '__main__',
                        'container-content',
                        'column-1',
                        'column-2',
                        'row-1',
                        'row-2',
                        'accordion-items',
                        'carousel-items',
                        'tab-items',
                        'flip-front',
                        'flip-back',
                        'snippet-content',
                    ],
                    allowedChildPlaceholders: [],
                },
            },
            {
                id: 'video',
                name: 'Video',
                description: 'Embeds a video.',
                datasource: {
                    templateId: '08a71664-6cf0-4a7f-a0fc-93a14d0a3d6a',
                    name: 'Video',
                    fields: [
                        { name: 'src', type: 'text' },
                        { name: 'autoplay', type: 'checkbox' },
                    ],
                },
                placement: {
                    allowedParentPlaceholders: [
                        '__main__',
                        'container-content',
                        'column-1',
                        'column-2',
                        'row-1',
                        'row-2',
                        'accordion-items',
                        'carousel-items',
                        'tab-items',
                        'flip-front',
                        'flip-back',
                        'snippet-content',
                    ],
                    allowedChildPlaceholders: [],
                },
            },
            {
                id: 'breadcrumb',
                name: 'Breadcrumb',
                description: "Shows the user's path through the site.",
                datasource: {
                    templateId: '3e02494c-9cb5-4c6b-b3f4-6a84592c77f8',
                    name: 'BreadcrumbData',
                    fields: [
                        { name: 'showCurrentPage', type: 'checkbox' },
                        { name: 'separator', type: 'text' },
                    ],
                },
                placement: {
                    allowedParentPlaceholders: ['header', '__main__'],
                    allowedChildPlaceholders: [],
                },
            },
            {
                id: 'link-list',
                name: 'Link List',
                description: 'Creates single or multiple links.',
                datasource: {
                    templateId: '82a8bf89-b0dd-59eeb-b00b-00b00792faf4',
                    name: 'LinkListData',
                    fields: [
                        { name: 'links', type: 'text' }, // Assuming a comma-separated list of links or similar
                    ],
                },
                placement: {
                    allowedParentPlaceholders: [
                        '__main__',
                        'container-content',
                        'column-1',
                        'column-2',
                        'row-1',
                        'row-2',
                        'accordion-items',
                        'carousel-items',
                        'tab-items',
                        'flip-front',
                        'flip-back',
                        'snippet-content',
                    ],
                    allowedChildPlaceholders: [],
                },
            },
            {
                id: 'navigation',
                name: 'Navigation',
                description: 'Displays the main site navigation menu.',
                datasource: {
                    templateId: 'be6e4210-8cf4-5054-b012-4f5a400e5710',
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
                    allowedParentPlaceholders: [
                        '__main__',
                        'container-content',
                        'column-1',
                        'column-2',
                        'row-1',
                        'row-2',
                        'accordion-items',
                        'carousel-items',
                        'tab-items',
                        'flip-front',
                        'flip-back',
                        'snippet-content',
                    ],
                    allowedChildPlaceholders: ['container-content'],
                },
            },
            {
                id: 'divider',
                name: 'Divider',
                description: 'A horizontal line to separate content.',
                placement: {
                    allowedParentPlaceholders: [
                        '__main__',
                        'container-content',
                        'column-1',
                        'column-2',
                        'row-1',
                        'row-2',
                    ],
                    allowedChildPlaceholders: [],
                },
            },
            {
                id: 'splitter-columns',
                name: 'Splitter (Columns)',
                description: 'Divides a section into columns.',
                placement: {
                    allowedParentPlaceholders: [
                        '__main__',
                        'container-content',
                        'row-1',
                        'row-2',
                    ],
                    allowedChildPlaceholders: ['column-1', 'column-2'],
                },
            },
            {
                id: 'splitter-rows',
                name: 'Splitter (Rows)',
                description: 'Divides a section into rows.',
                placement: {
                    allowedParentPlaceholders: [
                        '__main__',
                        'container-content',
                        'column-1',
                        'column-2',
                    ],
                    allowedChildPlaceholders: ['row-1', 'row-2'],
                },
            },
            {
                id: 'search-box',
                name: 'Search Box',
                description: 'The main search input field.',
                datasource: {
                    templateId: 'c5f905f8-fd1f-444a-a9d0-b6f0c0a87f61',
                    name: 'SearchBoxData',
                    fields: [
                        { name: 'placeholderText', type: 'text' },
                        { name: 'searchScope', type: 'text' },
                    ],
                },
                placement: {
                    allowedParentPlaceholders: [
                        'header',
                        '__main__',
                        'container-content',
                        'column-1',
                        'column-2',
                        'row-1',
                        'row-2',
                    ],
                    allowedChildPlaceholders: [],
                },
            },
            {
                id: 'search-results',
                name: 'Search Results',
                description: 'Displays the search results.',
                datasource: {
                    templateId: '2492bac4-da07-4c86-87f0-9d27b323ad63',
                    name: 'SearchResultsData',
                    fields: [
                        { name: 'resultsPerPage', type: 'number' },
                        { name: 'noResultsText', type: 'text' },
                    ],
                },
                placement: {
                    allowedParentPlaceholders: [
                        '__main__',
                        'container-content',
                    ],
                    allowedChildPlaceholders: [],
                },
            },
            {
                id: 'language-selector',
                name: 'Language Selector',
                description:
                    'Allows users to switch between different language versions of a page.',
                datasource: {
                    templateId: '9e28a6c1-7dc7-50af-a294-9818695dc157',
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
        ]);
    }
}
