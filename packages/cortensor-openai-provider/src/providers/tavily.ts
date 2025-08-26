/**
 * Simple Tavily Web Search Provider
 */

// import type { WebSearchResult, WebSearchCallback } from '../provider.js';
import type { WebSearchCallback, WebSearchResult } from '@/types';
import { tavily, type TavilySearchOptions } from '@tavily/core';


/**
 * Create a simple Tavily search function
 */
export function createTavilySearch(options: TavilySearchOptions  = {}): WebSearchCallback {
  console.log('🔧 [TAVILY] Creating Tavily search function...');
  console.log('🔧 [TAVILY] Options provided:', !!options);
  
  const apiKeyToBeUsed = options.apiKey || process.env.TAVILY_API_KEY;
  console.log('🔧 [TAVILY] Using API key from:', options.apiKey ? 'parameter' : 'environment');
  console.log('🔧 [TAVILY] API key available:', !!apiKeyToBeUsed);

  if (!apiKeyToBeUsed) {
    console.error('❌ [TAVILY] No API key found in parameter or environment variable');
    throw new Error('Tavily API key is required. Provide it as parameter or set TAVILY_API_KEY environment variable.');
  }

  console.log('🔧 [TAVILY] Creating Tavily client...');
  const client = tavily({ apiKey: apiKeyToBeUsed });
  console.log('✅ [TAVILY] Tavily client created successfully');

  return async (query: string): Promise<WebSearchResult[]> => {
    console.log('🌐 [TAVILY] Starting Tavily search...');
    console.log('🌐 [TAVILY] Query:', query);
    console.log('🌐 [TAVILY] Max results:', options.maxResults || 3);
    
    try {
      console.log('📡 [TAVILY] Making API call to Tavily...');
      const response = await client.search(query, {
        maxResults: options.maxResults || 3,
        includeImages: options.includeImages || false,
        searchDepth: options.searchDepth || 'basic',
      });
      
      console.log('📡 [TAVILY] API call completed successfully');
      console.log('📡 [TAVILY] Raw results count:', response.results?.length || 0);

      console.log('🔄 [TAVILY] Mapping results to WebSearchResult format...');
      const mappedResults = response.results.map((result: any, index: number) => {
        console.log(`🔄 [TAVILY] Mapping result ${index + 1}:`, {
          hasTitle: !!result.title,
          hasUrl: !!result.url,
          contentLength: result.content?.length || 0
        });
        
        return {
          title: result.title || '',
          url: result.url || '',
          snippet: result.content || '',
        };
      });
      
      console.log('✅ [TAVILY] Results mapped successfully, final count:', mappedResults.length);
      mappedResults.forEach((result, index) => {
        console.log(`✅ [TAVILY] Final result ${index + 1}:`, {
          title: result.title.substring(0, 50) + '...',
          url: result.url,
          snippetLength: result.snippet.length
        });
      });
      
      return mappedResults;
    } catch (error) {
      console.error('❌ [TAVILY] Search failed:', error);
      console.error('❌ [TAVILY] Error details:', {
        name: error instanceof Error ? error.name : 'Unknown',
        message: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : 'No stack trace'
      });
      
      throw new Error(`Tavily search failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };
}