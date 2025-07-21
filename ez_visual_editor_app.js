// EZ Visual Code Editor - Main Application JavaScript
// No-code visual editing with direct manipulation

let currentHTML = '';
let selectedElement = null;
let elementProperties = {};
let visualEditorDoc = null;
let snippetLibrary = [];

// Default snippet library
const defaultSnippets = [
    {
        id: 'query-link',
        name: 'Query Link',
        description: 'Convert text to clickable link',
        apply: (element, text) => {
            const link = document.createElement('a');
            link.href = '#';
            link.textContent = text;
            link.style.cssText = element.style.cssText;
            element.parentNode.replaceChild(link, element);
            return link;
        }
    },
    {
        id: 'glow-effect',
        name: 'Glow Effect',
        description: 'Add glow effect to element',
        apply: (element, intensity = '10px') => {
            element.style.boxShadow = `0 0 ${intensity} rgba(102, 126, 234, 0.6)`;
            return element;
        }
    },
    {
        id: 'hover-reveal',
        name: 'Hover Reveal Text',
        description: 'Add text that appears on hover',
        apply: (element, revealText = 'Hover text') => {
            element.setAttribute('title', revealText);
            element.style.position = 'relative';
            return element;
        }
    }
];

// Initialize application
function initializeApp() {
    snippetLibrary = [...defaultSnippets];
    showStatus('Welcome! Load HTML code to start visual editing.', 'info');
}

// Load file functionality
function loadFile(event) {
    const file = event.target.files[0];
    if (file && file.type === 'text/html') {
        const reader = new FileReader();
        reader.onload = function(e) {
            document.getElementById('codeInput').value = e.target.result;
            showStatus('File loaded successfully!', 'success');
        };
        reader.readAsText(file);
    } else {
        showStatus('Please select a valid HTML file.', 'warning');
    }
}

// Clear code functionality
function clearCode() {
    document.getElementById('codeInput').value = '';
    document.getElementById('previewFrame').src = 'about:blank';
    hideIndicators();
    showStatus('Code cleared.', 'info');
}

// Hide all indicators
function hideIndicators() {
    document.getElementById('tabIndicator').style.display = 'none';
    document.getElementById('effectIndicator').style.display = 'none';
    document.getElementById('interactiveIndicator').style.display = 'none';
    document.getElementById('saveCodeBtn').style.display = 'none';
}

// Analyze code and generate preview
function analyzeCode() {
    const code = document.getElementById('codeInput').value.trim();
    if (!code) {
        showStatus('Please enter some HTML code first.', 'warning');
        return;
    }

    currentHTML = code;
    
    // Generate preview
    const previewFrame = document.getElementById('previewFrame');
    const blob = new Blob([code], { type: 'text/html' });
    previewFrame.src = URL.createObjectURL(blob);

    // Analyze the code
    performAnalysis(code);

    // Show save button
    document.getElementById('saveCodeBtn').style.display = 'inline-block';

    showStatus('Code analyzed successfully! You can now use Visual Edit mode.', 'success');
}

// Enhanced analysis function
function performAnalysis(code) {
    // Basic pattern detection
    const patterns = {
        tabSystem: code.includes(':target') || code.includes('.tabs'),
        visualEffects: code.includes('glitch') || code.includes('bleeding') || code.includes('blur'),
        interactiveElements: code.includes(':hover') || code.includes('star')
    };

    // Update indicators
    updateIndicators(patterns);
}

// Update visual indicators
function updateIndicators(patterns) {
    document.getElementById('tabIndicator').style.display = patterns.tabSystem ? 'inline-block' : 'none';
    document.getElementById('effectIndicator').style.display = patterns.visualEffects ? 'inline-block' : 'none';
    document.getElementById('interactiveIndicator').style.display = patterns.interactiveElements ? 'inline-block' : 'none';
}

// Visual Editor Functions
function openVisualEditor() {
    if (!currentHTML) {
        showStatus('Please analyze some code first.', 'warning');
        return;
    }

    const visualEditor = document.getElementById('visualEditor');
    const visualFrame = document.getElementById('visualEditorFrame');
    
    // Create enhanced HTML with editing capabilities
    const enhancedHTML = injectEditingCapabilities(currentHTML);
    const blob = new Blob([enhancedHTML], { type: 'text/html' });
    visualFrame.src = URL.createObjectURL(blob);
    
    visualEditor.classList.add('active');
    
    // Wait for frame to load, then setup editing
    visualFrame.onload = function() {
        setupVisualEditing();
    };
    
    showStatus('Visual editor opened. Click on elements to edit them!', 'info');
}

function closeVisualEditor() {
    document.getElementById('visualEditor').classList.remove('active');
    document.getElementById('propertyPanel').classList.remove('active');
    selectedElement = null;
}

function injectEditingCapabilities(html) {
    // Inject CSS and JS for visual editing
    const editingCSS = `
        <style id="visual-editing-styles">
            .ez-editable {
                cursor: pointer !important;
                transition: all 0.2s ease !important;
            }
            .ez-editable:hover {
                outline: 2px solid #667eea !important;
                outline-offset: 2px !important;
            }
            .ez-selected {
                outline: 2px solid #f59e0b !important;
                outline-offset: 2px !important;
                background: rgba(245, 158, 11, 0.1) !important;
            }
        </style>
    `;

    const editingJS = `
        <script>
            window.addEventListener('message', function(event) {
                if (event.data.type === 'setupEditing') {
                    setupElementEditing();
                } else if (event.data.type === 'updateElement') {
                    updateElementFromProperties(event.data.elementId, event.data.properties);
                }
            });

            function setupElementEditing() {
                // Make text elements editable
                const textElements = document.querySelectorAll('h1, h2, h3, h4, h5, h6, p, span, a, div');
                textElements.forEach((el, index) => {
                    if (el.textContent.trim() && !el.querySelector('*')) {
                        el.classList.add('ez-editable');
                        el.setAttribute('data-ez-id', 'text-' + index);
                        el.addEventListener('click', function(e) {
                            e.preventDefault();
                            e.stopPropagation();
                            selectElement(el);
                        });
                    }
                });

                // Make interactive elements editable
                const interactiveElements = document.querySelectorAll('.star, .star-system, [class*="star"], [class*="glow"], [class*="hover"]');
                interactiveElements.forEach((el, index) => {
                    el.classList.add('ez-editable');
                    el.setAttribute('data-ez-id', 'interactive-' + index);
                    el.addEventListener('click', function(e) {
                        e.preventDefault();
                        e.stopPropagation();
                        selectElement(el);
                    });
                });
            }

            function selectElement(element) {
                // Remove previous selection
                document.querySelectorAll('.ez-selected').forEach(el => {
                    el.classList.remove('ez-selected');
                });

                // Select current element
                element.classList.add('ez-selected');

                // Send element data to parent
                const elementData = {
                    type: 'elementSelected',
                    elementId: element.getAttribute('data-ez-id'),
                    tagName: element.tagName.toLowerCase(),
                    textContent: element.textContent,
                    className: element.className,
                    styles: window.getComputedStyle(element),
                    attributes: Array.from(element.attributes).reduce((acc, attr) => {
                        acc[attr.name] = attr.value;
                        return acc;
                    }, {})
                };

                window.parent.postMessage(elementData, '*');
            }

            function updateElementFromProperties(elementId, properties) {
                const element = document.querySelector('[data-ez-id="' + elementId + '"]');
                if (!element) return;

                // Update text content
                if (properties.textContent !== undefined) {
                    element.textContent = properties.textContent;
                }

                // Update styles
                if (properties.styles) {
                    Object.keys(properties.styles).forEach(prop => {
                        element.style[prop] = properties.styles[prop];
                    });
                }

                // Update attributes
                if (properties.attributes) {
                    Object.keys(properties.attributes).forEach(attr => {
                        element.setAttribute(attr, properties.attributes[attr]);
                    });
                }
            }
        </script>
    `;

    // Insert editing capabilities into the HTML
    let enhancedHTML = html;
    if (html.includes('</head>')) {
        enhancedHTML = html.replace('</head>', editingCSS + '</head>');
    } else {
        enhancedHTML = editingCSS + html;
    }

    if (html.includes('</body>')) {
        enhancedHTML = enhancedHTML.replace('</body>', editingJS + '</body>');
    } else {
        enhancedHTML = enhancedHTML + editingJS;
    }

    return enhancedHTML;
}

function setupVisualEditing() {
    visualEditorDoc = document.getElementById('visualEditorFrame').contentDocument;
    
    // Send setup message to iframe
    document.getElementById('visualEditorFrame').contentWindow.postMessage({
        type: 'setupEditing'
    }, '*');

    // Listen for messages from iframe
    window.addEventListener('message', function(event) {
        if (event.data.type === 'elementSelected') {
            handleElementSelection(event.data);
        }
    });
}

function handleElementSelection(elementData) {
    selectedElement = elementData;
    showPropertyPanel(elementData);
}

function showPropertyPanel(elementData) {
    const panel = document.getElementById('propertyPanel');
    const header = document.getElementById('selectedElementType');
    const content = document.getElementById('propertyPanelContent');

    header.textContent = `${elementData.tagName.toUpperCase()} Element`;

    // Detect element capabilities
    const capabilities = detectElementCapabilities(elementData);

    content.innerHTML = `
        <div class="property-group">
            <h4>Content</h4>
            <div class="property-field">
                <label>Text Content:</label>
                <textarea id="prop-text" onchange="updateElementProperty('textContent', this.value)">${elementData.textContent}</textarea>
            </div>
        </div>

        ${capabilities.canHaveLink ? `
        <div class="property-group">
            <h4>Link Properties</h4>
            <div class="snippet-selector">
                <h5>Apply Snippet:</h5>
                <div class="snippet-option">
                    <input type="radio" id="snippet-none" name="snippet" value="none" checked>
                    <label for="snippet-none">No snippet</label>
                </div>
                <div class="snippet-option">
                    <input type="radio" id="snippet-link" name="snippet" value="query-link">
                    <label for="snippet-link">Query Link (make clickable)</label>
                </div>
            </div>
        </div>
        ` : ''}

        ${capabilities.canHaveEffects ? `
        <div class="property-group">
            <h4>Visual Effects</h4>
            <div class="property-field">
                <label>Glow Intensity:</label>
                <input type="range" id="prop-glow" min="0" max="30" value="0" onchange="updateGlowEffect(this.value)">
                <span id="glow-value">0px</span>
            </div>
            <div class="property-field">
                <label>Hover Reveal Text:</label>
                <input type="text" id="prop-hover-text" placeholder="Text to show on hover" onchange="updateHoverText(this.value)">
            </div>
        </div>
        ` : ''}

        ${capabilities.canMove ? `
        <div class="property-group">
            <h4>Position</h4>
            <div class="property-field">
                <label>Move Element:</label>
                <div class="position-controls">
                    <div class="position-btn" onclick="moveElement('up-left')">↖</div>
                    <div class="position-btn" onclick="moveElement('up')">↑</div>
                    <div class="position-btn" onclick="moveElement('up-right')">↗</div>
                    <div class="position-btn" onclick="moveElement('left')">←</div>
                    <div class="position-btn center">⊙</div>
                    <div class="position-btn" onclick="moveElement('right')">→</div>
                    <div class="position-btn" onclick="moveElement('down-left')">↙</div>
                    <div class="position-btn" onclick="moveElement('down')">↓</div>
                    <div class="position-btn" onclick="moveElement('down-right')">↘</div>
                </div>
            </div>
        </div>
        ` : ''}

        <div class="property-group">
            <h4>Actions</h4>
            <button class="btn btn-primary" onclick="applySelectedSnippet()">Apply Snippet</button>
            <button class="btn btn-secondary" onclick="resetElement()">Reset Element</button>
        </div>
    `;

    panel.classList.add('active');
}

function detectElementCapabilities(elementData) {
    return {
        canHaveLink: elementData.tagName !== 'a',
        canHaveEffects: true,
        canMove: elementData.className.includes('star') || elementData.styles.position === 'absolute' || elementData.styles.position === 'relative'
    };
}

function updateElementProperty(property, value) {
    if (!selectedElement) return;

    const updateData = {
        type: 'updateElement',
        elementId: selectedElement.elementId,
        properties: {}
    };

    updateData.properties[property] = value;

    document.getElementById('visualEditorFrame').contentWindow.postMessage(updateData, '*');
    updateCurrentHTML();
}

function updateCurrentHTML() {
    const frameDoc = document.getElementById('visualEditorFrame').contentDocument;
    const clonedDoc = frameDoc.cloneNode(true);
    
    // Clean up editing classes and scripts
    clonedDoc.querySelectorAll('.ez-editable, .ez-selected').forEach(el => {
        el.classList.remove('ez-editable', 'ez-selected');
        el.removeAttribute('data-ez-id');
    });
    
    const editingStyles = clonedDoc.getElementById('visual-editing-styles');
    if (editingStyles) editingStyles.remove();
    
    const editingScripts = clonedDoc.querySelectorAll('script');
    editingScripts.forEach(script => {
        if (script.textContent.includes('setupElementEditing')) {
            script.remove();
        }
    });

    currentHTML = clonedDoc.documentElement.outerHTML;
}

function updateGlowEffect(intensity) {
    document.getElementById('glow-value').textContent = intensity + 'px';
    
    if (!selectedElement) return;

    const updateData = {
        type: 'updateElement',
        elementId: selectedElement.elementId,
        properties: {
            styles: {
                boxShadow: intensity > 0 ? `0 0 ${intensity}px rgba(102, 126, 234, 0.6)` : 'none'
            }
        }
    };

    document.getElementById('visualEditorFrame').contentWindow.postMessage(updateData, '*');
    updateCurrentHTML();
}

function updateHoverText(text) {
    if (!selectedElement) return;

    const updateData = {
        type: 'updateElement',
        elementId: selectedElement.elementId,
        properties: {
            attributes: {
                title: text
            }
        }
    };

    document.getElementById('visualEditorFrame').contentWindow.postMessage(updateData, '*');
    updateCurrentHTML();
}

function moveElement(direction) {
    if (!selectedElement) return;

    const moveAmount = 10;
    let deltaX = 0, deltaY = 0;

    switch(direction) {
        case 'up': deltaY = -moveAmount; break;
        case 'down': deltaY = moveAmount; break;
        case 'left': deltaX = -moveAmount; break;
        case 'right': deltaX = moveAmount; break;
        case 'up-left': deltaX = -moveAmount; deltaY = -moveAmount; break;
        case 'up-right': deltaX = moveAmount; deltaY = -moveAmount; break;
        case 'down-left': deltaX = -moveAmount; deltaY = moveAmount; break;
        case 'down-right': deltaX = moveAmount; deltaY = moveAmount; break;
    }

    const currentLeft = parseInt(selectedElement.styles.left) || 0;
    const currentTop = parseInt(selectedElement.styles.top) || 0;

    const updateData = {
        type: 'updateElement',
        elementId: selectedElement.elementId,
        properties: {
            styles: {
                position: 'relative',
                left: (currentLeft + deltaX) + 'px',
                top: (currentTop + deltaY) + 'px'
            }
        }
    };

    document.getElementById('visualEditorFrame').contentWindow.postMessage(updateData, '*');
    updateCurrentHTML();
}

function applySelectedSnippet() {
    const selectedSnippet = document.querySelector('input[name="snippet"]:checked');
    if (!selectedSnippet || selectedSnippet.value === 'none' || !selectedElement) return;

    const snippetId = selectedSnippet.value;
    const snippet = snippetLibrary.find(s => s.id === snippetId);
    
    if (snippet && snippet.id === 'query-link') {
        // Convert to link
        const updateData = {
            type: 'updateElement',
            elementId: selectedElement.elementId,
            properties: {
                attributes: {
                    href: '#'
                },
                styles: {
                    color: '#667eea',
                    textDecoration: 'underline',
                    cursor: 'pointer'
                }
            }
        };

        document.getElementById('visualEditorFrame').contentWindow.postMessage(updateData, '*');
        updateCurrentHTML();
        showStatus('Query link applied successfully!', 'success');
    }
}

function resetElement() {
    if (!selectedElement) return;

    const updateData = {
        type: 'updateElement',
        elementId: selectedElement.elementId,
        properties: {
            styles: {
                boxShadow: 'none',
                left: '0px',
                top: '0px',
                position: 'static'
            },
            attributes: {
                title: ''
            }
        }
    };

    document.getElementById('visualEditorFrame').contentWindow.postMessage(updateData, '*');
    updateCurrentHTML();
    showStatus('Element reset to default state.', 'info');
}

function saveFromVisualEditor() {
    updateCurrentHTML();
    
    // Update the code input with the modified HTML
    document.getElementById('codeInput').value = currentHTML;

    // Update main preview
    const previewFrame = document.getElementById('previewFrame');
    const blob = new Blob([currentHTML], { type: 'text/html' });
    previewFrame.src = URL.createObjectURL(blob);

    closeVisualEditor();
    showStatus('Changes saved successfully!', 'success');
}

// Save current code as file
function saveCurrentCode() {
    if (!currentHTML) {
        showStatus('No code to save. Please analyze some code first.', 'warning');
        return;
    }
    
    const blob = new Blob([currentHTML], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'visual_edited_code.html';
    a.click();
    URL.revokeObjectURL(url);
    
    showStatus('HTML file saved successfully!', 'success');
}

// Show status message
function showStatus(message, type) {
    // Create or update status message
    let statusDiv = document.querySelector('.status-message');
    if (!statusDiv) {
        statusDiv = document.createElement('div');
        statusDiv.className = 'status-message';
        document.querySelector('.container').insertBefore(statusDiv, document.querySelector('.main-layout'));
    }
    
    statusDiv.className = `status-message status-${type}`;
    statusDiv.textContent = message;
    statusDiv.style.display = 'block';
    
    setTimeout(() => {
        statusDiv.style.display = 'none';
    }, 5000);
}

// Initialize app when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
});