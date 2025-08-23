import { defineBackground } from '#imports';
import type { 
  ExtensionMessage, 
  TextSelectionData, 
  MessageResponse,
  TextSelectedMessage,
  GetSelectedTextMessage,
  ClearSelectedTextMessage
} from '../types/messaging';

export default defineBackground(() => {
  console.log('Background script loaded!', { id: browser.runtime.id });
  
  // Store the latest selected text
  let latestSelectedText: TextSelectionData | null = null;

  // Handle extension icon click to open sidepanel
  browser.action.onClicked.addListener(async (tab) => {
    if (tab.id) {
      await browser.sidePanel.open({ tabId: tab.id });
    }
  });

  // Set up sidepanel options on install
  browser.runtime.onInstalled.addListener(async () => {
    await browser.sidePanel.setOptions({
      path: 'sidepanel.html',
      enabled: true
    });
    
    await browser.sidePanel.setPanelBehavior({
      openPanelOnActionClick: true
    });
  });

  // Handle messages from content script and sidepanel
  browser.runtime.onMessage.addListener(
    (message: ExtensionMessage, sender: Browser.runtime.MessageSender, sendResponse: (response: MessageResponse) => void) => {
      console.log('Background received message:', message);
      
      if (message.type === 'TEXT_SELECTED') {
        const textMessage = message as TextSelectedMessage;
        // Store the selected text from content script
        latestSelectedText = {
          text: textMessage.text,
          url: textMessage.url,
          timestamp: textMessage.timestamp
        };
        
        console.log('Text selected:', latestSelectedText);
        
        // Notify sidepanel if it's open
        browser.runtime.sendMessage({
          type: 'TEXT_SELECTION_UPDATE',
          data: latestSelectedText
        }).catch(() => {
          // Sidepanel might not be open, that's okay
          console.log('Sidepanel not available to receive text selection');
        });
        
        sendResponse({ success: true });
      }
      
      if (message.type === 'GET_SELECTED_TEXT') {
        // Sidepanel requesting the latest selected text
        sendResponse({ 
          success: true, 
          data: latestSelectedText 
        });
      }
      
      if (message.type === 'CLEAR_SELECTED_TEXT') {
        // Clear the stored selected text
        latestSelectedText = null;
        sendResponse({ success: true });
      }
      
      return true; // Keep the message channel open for async response
    }
  );

});
