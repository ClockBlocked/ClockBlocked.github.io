////////////////////////////////////////////////////////////
////////////////////////////////////  S E T U P  ///////////
let templates = {};
let langMap = {};
let baseUrl = '';

acode.setPluginInit('com.acode.commentmanager', (url, $page, cache) => {
  baseUrl = url;
  
  fetch(baseUrl + 'templates.json')
    .then(res => res.json())
    .then(data => {
      templates = data;
      initLanguageMap();
      addCommands();
      window.toast('Comment Manager ready!', 2000);
    })
    .catch(err => {
      console.error('Failed to load templates:', err);
      window.toast('Comment Manager loaded (templates failed)', 3000);
      initLanguageMap();
      addCommands();
    });
});

acode.setPluginUnmount('com.acode.commentmanager', () => {
  const { commands } = editorManager.editor;
  commands.removeCommand('commentManager:removeAll');
  commands.removeCommand('commentManager:removeSingle');
  commands.removeCommand('commentManager:removeMulti');
  commands.removeCommand('commentManager:addTemplate');
  commands.removeCommand('commentManager:replace');
  commands.removeCommand('commentManager:menu');
});


function addCommands() {
  const { commands } = editorManager.editor;
  
  commands.addCommand({
    name: 'commentManager:menu',
    description: 'Open Comment Manager',
    exec: showMainMenu
  });
  
  commands.addCommand({
    name: 'commentManager:removeAll',
    description: 'Remove all comments',
    exec: () => removeComments('all')
  });

  commands.addCommand({
    name: 'commentManager:removeSingle',
    description: 'Remove single-line comments',
    exec: () => removeComments('single')
  });

  commands.addCommand({
    name: 'commentManager:removeMulti',
    description: 'Remove multi-line comments',
    exec: () => removeComments('multi')
  });

  commands.addCommand({
    name: 'commentManager:addTemplate',
    description: 'Add comment template',
    exec: showTemplateSelector
  });

  commands.addCommand({
    name: 'commentManager:replace',
    description: 'Replace comments',
    exec: showReplaceDialog
  });
}

async function showMainMenu() {
  try {
    const choice = await acode.select('Comment Manager', [
      { text: '🗑️ Remove All Comments', value: 'removeAll' },
      { text: '📝 Remove Single-Line', value: 'removeSingle' },
      { text: '📄 Remove Multi-Line', value: 'removeMulti' },
      { text: '➕ Add Template', value: 'addTemplate' },
      { text: '🔄 Replace Text in Comments', value: 'replace' },
      { text: '📋 Browse Templates', value: 'browse' }
    ]);

    if (!choice) return;

    switch(choice) {
      case 'removeAll':
        removeComments('all');
        break;
      case 'removeSingle':
        removeComments('single');
        break;
      case 'removeMulti':
        removeComments('multi');
        break;
      case 'addTemplate':
        showTemplateSelector();
        break;
      case 'replace':
        showReplaceDialog();
        break;
      case 'browse':
        showTemplateBrowser();
        break;
    }
  } catch (error) {
    console.error('Main menu error:', error);
    window.toast('Menu error', 3000);
  }
}
async function showTemplateBrowser() {
  try {
    const lang = getCurrentLanguage();
    const categories = Object.keys(templates);
    
    if (categories.length === 0) {
      window.toast('Templates not loaded yet', 3000);
      return;
    }
    
    const categoryItems = categories.map(cat => ({
      text: cat.charAt(0).toUpperCase() + cat.slice(1),
      value: cat
    }));

    const category = await acode.select('Browse Templates', categoryItems);
    if (!category) return;

    const categoryTemplates = templates[category];
    const items = Object.keys(categoryTemplates)
      .filter(key => categoryTemplates[key].templates && categoryTemplates[key].templates[lang])
      .map(key => ({
        text: categoryTemplates[key].name,
        value: key
      }));

    if (items.length === 0) {
      window.toast('No templates in this category', 3000);
      return;
    }

    const selected = await acode.select(category, items);
    if (!selected) return;

    const template = categoryTemplates[selected].templates[lang];
    
    const insert = await acode.confirm('Template Preview', template);
    if (insert) {
      insertTemplate(template);
    }
  } catch (error) {
    console.error('Template browser error:', error);
    window.toast('Browser error', 3000);
  }
}





////////////////////////////////////////////////////////////
////////////////////////////////  H E L P E R S  ///////////
function initLanguageMap() {
  langMap = {
    'javascript': 'js',
    'typescript': 'js',
    'jsx': 'js',
    'tsx': 'js',
    'css': 'css',
    'scss': 'css',
    'sass': 'css',
    'less': 'css',
    'html': 'html',
    'xml': 'html',
    'vue': 'html',
    'python': 'python',
    'php': 'js',
    'java': 'js',
    'c': 'js',
    'cpp': 'js',
    'csharp': 'js',
    'go': 'js',
    'rust': 'js',
    'swift': 'js',
    'kotlin': 'js'
  };
}
function getCurrentLanguage() {
  try {
    const session = editorManager.editor.session;
    const mode = session.$modeId || '';
    const lang = mode.split('/').pop() || 'javascript';
    return langMap[lang] || 'js';
  } catch (e) {
    return 'js';
  }
}





////////////////////////////////////////////////////////////
///////////////////////  Comment CleanUps (removals) ///////
function removeComments(type) { // Default
  try {
    const editor = editorManager.editor;
    const content = editor.getValue();
    const lang = getCurrentLanguage();
    
    let result;
    
    switch(lang) {
      case 'html':
        result = removeHTMLComments(content, type);
        break;
      case 'css':
        result = removeCSSComments(content, type);
        break;
      case 'python':
        result = removePythonComments(content, type);
        break;
      default:
        result = removeJSComments(content, type);
    }

    if (result !== content) {
      editor.setValue(result);
      window.toast('Comments removed successfully', 3000);
    } else {
      window.toast('No comments found', 3000);
    }
  } catch (error) {
    console.error('Remove comments error:', error);
    window.toast('Error removing comments', 3000);
  }
}
function removeJSComments(code, type) { // JavaScript
  let result = code;
  
  if (type === 'all' || type === 'multi') { // Multi-line
    result = result.replace(/\/\*[\s\S]*?\*\//g, (match, offset) => {
      if (isInsideString(code, offset)) return match;
      return match.replace(/[^\n]/g, '');
    });
  }

  if (type === 'all' || type === 'single') { // Single-line
    const lines = result.split('\n');
    result = lines.map(line => {
      return line.replace(/\/\/(?=(?:[^"'`]*["'`][^"'`]*["'`])*[^"'`]*$).*$/g, '');
    }).join('\n');
  }

  return result;
}
function removeCSSComments(code, type) { // CSS
  if (type === 'single') {
    window.toast('CSS only has multi-line comments', 3000);
    return code;
  }

  return code.replace(/\/\*[\s\S]*?\*\//g, (match, offset) => {
    if (isInsideString(code, offset)) return match;
    return match.replace(/[^\n]/g, '');
  });
}
function removeHTMLComments(code, type) { // HTML
  if (type === 'single') {
    window.toast('HTML only has multi-line comments', 3000);
    return code;
  }

  return code.replace(/<!--[\s\S]*?-->/g, (match, offset) => {
    const before = code.substring(0, offset);
    const scriptDepth = (before.match(/<script[^>]*>/gi) || []).length - 
                       (before.match(/<\/script>/gi) || []).length;
    const styleDepth = (before.match(/<style[^>]*>/gi) || []).length - 
                      (before.match(/<\/style>/gi) || []).length;
    
    if (scriptDepth > 0 || styleDepth > 0) return match;
    return match.replace(/[^\n]/g, '');
  });
}
function removePythonComments(code, type) { // Python
  let result = code;

  if (type === 'all' || type === 'multi') {
    result = result.replace(/"""[\s\S]*?"""|'''[\s\S]*?'''/g, (match, offset) => {
      const before = code.substring(0, offset).trimEnd();
      if (before.endsWith(':') || /^[\s]*$/.test(before)) {
        return match;
      }
      return match.replace(/[^\n]/g, '');
    });
  }

  if (type === 'all' || type === 'single') {
    const lines = result.split('\n');
    result = lines.map(line => {
      return line.replace(/#(?=(?:[^"']*["'][^"']*["'])*[^"']*$).*$/g, '');
    }).join('\n');
  }

  return result;
}
function isInsideString(code, position) { // Safeties
  const before = code.substring(0, position);
  const singleQuotes = (before.match(/(?<!\\)'/g) || []).length;
  const doubleQuotes = (before.match(/(?<!\\)"/g) || []).length;
  const backticks = (before.match(/(?<!\\)`/g) || []).length;
  
  return (singleQuotes % 2 !== 0) || (doubleQuotes % 2 !== 0) || (backticks % 2 !== 0);
}





////////////////////////////////////////////////////////////
///////////////////////  Comment Organizers (replace) //////
async function showReplaceDialog() {
  try {
    const options = await acode.select('Replace Options', [
      { text: 'Find and replace specific text', value: 'find' },
      { text: 'Replace all comments (coming soon)', value: 'all' }
    ]);

    if (!options) return;

    if (options === 'find') {
      await findReplaceComments();
      return;
    }

    window.toast('Feature coming soon', 2000);
  } catch (error) {
    console.error('Replace dialog error:', error);
    window.toast('Error showing replace options', 3000);
  }
}
async function findReplaceComments() {
  try {
    const findText = await acode.prompt('Find text in comments', '');
    if (!findText) return;

    const replaceText = await acode.prompt('Replace with', '');
    if (replaceText === null) return;

    const editor = editorManager.editor;
    const content = editor.getValue();
    const lang = getCurrentLanguage();
    
    let result = replaceInComments(content, findText, replaceText, lang);
    
    if (result !== content) {
      editor.setValue(result);
      window.toast('Comments updated', 3000);
    } else {
      window.toast('No matches found', 3000);
    }
  } catch (error) {
    console.error('Find replace error:', error);
    window.toast('Error replacing text', 3000);
  }
}

function replaceInComments(code, find, replace, lang) {
  const regex = new RegExp(find.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g');
  
  switch(lang) {
    case 'html':
      return code.replace(/<!--([\s\S]*?)-->/g, (match, content) => {
        return `<!--${content.replace(regex, replace)}-->`;
      });
    
    case 'css':
      return code.replace(/\/\*([\s\S]*?)\*\//g, (match, content) => {
        return `/*${content.replace(regex, replace)}*/`;
      });
    
    case 'python':
      return code.split('\n').map(line => {
        return line.replace(/(#.*)$/g, (match) => {
          return match.replace(regex, replace);
        });
      }).join('\n');
    
    default:
      let result = code.replace(/\/\*([\s\S]*?)\*\//g, (match, content) => {
        return `/*${content.replace(regex, replace)}*/`;
      });
      
      result = result.split('\n').map(line => {
        return line.replace(/(\/\/.*)$/g, (match) => {
          return match.replace(regex, replace);
        });
      }).join('\n');
      
      return result;
  }
}





////////////////////////////////////////////////////////////
////////////////////////////  T E M P L A T E S  ///////////
async function showTemplateSelector() {
  try {
    const lang = getCurrentLanguage();
    const categories = Object.keys(templates);
    
    if (categories.length === 0) {
      window.toast('Templates not loaded yet', 3000);
      return;
    }
    
    const items = [];
    
    categories.forEach(category => {
      const categoryTemplates = templates[category];
      Object.keys(categoryTemplates).forEach(key => {
        const template = categoryTemplates[key];
        if (template.templates && template.templates[lang]) {
          items.push({
            text: `${category} → ${template.name}`,
            value: { category, key, template: template.templates[lang] }
          });
        }
      });
    });

    if (items.length === 0) {
      window.toast('No templates available for this language', 3000);
      return;
    }

    const selection = await acode.select('Select Template', items);
    if (!selection) return;

    insertTemplate(selection.template);
  } catch (error) {
    console.error('Template selector error:', error);
    window.toast('Error showing templates', 3000);
  }
}
async function insertTemplate(template) {
  try {
    const placeholders = template.match(/\{([A-Z]+)\}/g);
    
    if (!placeholders) {
      insertAtCursor(template);
      return;
    }

    let finalTemplate = template;
    
    for (const placeholder of [...new Set(placeholders)]) {
      const key = placeholder.slice(1, -1);
      const value = await acode.prompt(`Enter ${key}`, '');
      
      if (value === null) return;
      
      finalTemplate = finalTemplate.replace(new RegExp(placeholder, 'g'), value || '');
    }

    insertAtCursor(finalTemplate);
  } catch (error) {
    console.error('Insert template error:', error);
    window.toast('Error inserting template', 3000);
  }
}

function insertAtCursor(text) {
  try {
    const editor = editorManager.editor;
    const cursor = editor.getCursorPosition();
    editor.session.insert(cursor, text);
    window.toast('Template inserted', 2000);
  } catch (error) {
    console.error('Insert at cursor error:', error);
    window.toast('Error inserting text', 3000);
  }
}
/**
 * 
 *  C R E A T E D  B Y
 * 
 *  William Hanson 
 * 
 *  Chevrolay@Outlook.com
 * 
 *  m.me/Chevrolay
 * 
 */