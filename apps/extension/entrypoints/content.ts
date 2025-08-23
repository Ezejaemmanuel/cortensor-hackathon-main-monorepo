import type { TextSelectedMessage } from '../types/messaging';

export default defineContentScript({
  matches: ['<all_urls>'],
  main() {
    console.log('Cortensor content script loaded');
    
    let lastSelectedText = '';
    
    // Function to get selected text
    function getSelectedText(): string {
      const selection = window.getSelection();
      return selection ? selection.toString().trim() : '';
    }
    
    // Function to send selected text to extension
    function sendSelectedText(text: string): void {
      if (text && text !== lastSelectedText) {
        lastSelectedText = text;
        const message: TextSelectedMessage = {
          type: 'TEXT_SELECTED',
          text: text,
          url: window.location.href,
          timestamp: Date.now()
        };
        
        browser.runtime.sendMessage(message).catch(error => {
          console.log('Failed to send message:', error);
        });
      }
    }
    
    // Listen for text selection events
    document.addEventListener('mouseup', () => {
      setTimeout(() => {
        const selectedText = getSelectedText();
        if (selectedText) {
          sendSelectedText(selectedText);
        }
      }, 100); // Small delay to ensure selection is complete
    });
    
    // Listen for keyboard selection (Shift + Arrow keys, Ctrl+A, etc.)
    document.addEventListener('keyup', (event) => {
      // Check if it's a selection-related key combination
      if (event.shiftKey || event.ctrlKey || event.metaKey) {
        setTimeout(() => {
          const selectedText = getSelectedText();
          if (selectedText) {
            sendSelectedText(selectedText);
          }
        }, 100);
      }
    });
    
    // Listen for double-click selection
    document.addEventListener('dblclick', () => {
      setTimeout(() => {
        const selectedText = getSelectedText();
        if (selectedText) {
          sendSelectedText(selectedText);
        }
      }, 100);
    });
    
    console.log('Text selection tracking initialized');
  },
});
