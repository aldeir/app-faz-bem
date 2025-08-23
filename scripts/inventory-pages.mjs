#!/usr/bin/env node

/* =============================================================================
   PAGE INVENTORY SCRIPT
   Generates inventory report of all HTML pages for UI refactor planning
   ============================================================================= */

import { readFileSync, writeFileSync, readdirSync, statSync } from 'fs';
import { join, extname, relative } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const rootDir = join(__dirname, '..');

/**
 * Extract meta tags from HTML content
 */
function extractMetaTags(content) {
  const metaRegex = /<meta\s+[^>]*>/gi;
  const matches = content.match(metaRegex) || [];
  
  return {
    count: matches.length,
    tags: matches.map(tag => {
      const nameMatch = tag.match(/name=["']([^"']+)["']/i);
      const propertyMatch = tag.match(/property=["']([^"']+)["']/i);
      const contentMatch = tag.match(/content=["']([^"']+)["']/i);
      
      return {
        type: nameMatch ? nameMatch[1] : (propertyMatch ? propertyMatch[1] : 'unknown'),
        content: contentMatch ? contentMatch[1] : '',
        raw: tag.trim()
      };
    })
  };
}

/**
 * Count inline styles and scripts
 */
function countInlineContent(content) {
  const styleBlocks = content.match(/<style[^>]*>[\s\S]*?<\/style>/gi) || [];
  const scriptBlocks = content.match(/<script[^>]*>[\s\S]*?<\/script>/gi) || [];
  
  // Count style attributes
  const inlineStyles = content.match(/style=["'][^"']*["']/gi) || [];
  
  // Count external stylesheets and scripts
  const externalCSS = content.match(/<link[^>]*rel=["']stylesheet["'][^>]*>/gi) || [];
  const externalJS = content.match(/<script[^>]*src=["'][^"']*["'][^>]*>/gi) || [];
  
  return {
    inlineStyles: {
      blocks: styleBlocks.length,
      attributes: inlineStyles.length,
      totalLines: styleBlocks.reduce((acc, block) => acc + block.split('\n').length, 0)
    },
    inlineScripts: {
      blocks: scriptBlocks.length,
      totalLines: scriptBlocks.reduce((acc, block) => acc + block.split('\n').length, 0)
    },
    external: {
      css: externalCSS.length,
      js: externalJS.length
    }
  };
}

/**
 * Extract page title and basic info
 */
function extractPageInfo(content) {
  const titleMatch = content.match(/<title[^>]*>([^<]+)<\/title>/i);
  const title = titleMatch ? titleMatch[1].trim() : 'No title';
  
  // Check for viewport meta tag
  const viewportMatch = content.match(/<meta[^>]*name=["']viewport["'][^>]*>/i);
  const hasViewport = !!viewportMatch;
  
  // Check for theme-color
  const themeColorMatch = content.match(/<meta[^>]*name=["']theme-color["'][^>]*>/i);
  const hasThemeColor = !!themeColorMatch;
  
  // Check for PWA manifest
  const manifestMatch = content.match(/<link[^>]*rel=["']manifest["'][^>]*>/i);
  const hasManifest = !!manifestMatch;
  
  return {
    title,
    hasViewport,
    hasThemeColor,
    hasManifest
  };
}

/**
 * Analyze dependencies and imports
 */
function analyzeDependencies(content) {
  // CSS dependencies
  const cssLinks = content.match(/<link[^>]*href=["']([^"']+)["'][^>]*rel=["']stylesheet["'][^>]*>/gi) || [];
  const cssFiles = cssLinks.map(link => {
    const hrefMatch = link.match(/href=["']([^"']+)["']/i);
    return hrefMatch ? hrefMatch[1] : '';
  }).filter(Boolean);
  
  // JS dependencies (external)
  const jsLinks = content.match(/<script[^>]*src=["']([^"']+)["'][^>]*>/gi) || [];
  const jsFiles = jsLinks.map(script => {
    const srcMatch = script.match(/src=["']([^"']+)["']/i);
    return srcMatch ? srcMatch[1] : '';
  }).filter(Boolean);
  
  // Font links
  const fontLinks = content.match(/<link[^>]*href=["'][^"']*fonts[^"']*["'][^>]*>/gi) || [];
  
  return {
    css: cssFiles,
    js: jsFiles,
    fonts: fontLinks.length,
    hasGoogleFonts: fontLinks.some(link => link.includes('fonts.googleapis.com')),
    hasTailwind: cssFiles.some(file => file.includes('style.css')) || content.includes('tailwind'),
    hasBootstrap: cssFiles.some(file => file.includes('bootstrap')) || content.includes('bootstrap')
  };
}

/**
 * Analyze a single HTML file
 */
function analyzeHTMLFile(filePath) {
  try {
    const content = readFileSync(filePath, 'utf-8');
    const lines = content.split('\n').length;
    const size = statSync(filePath).size;
    
    const pageInfo = extractPageInfo(content);
    const metaTags = extractMetaTags(content);
    const inlineContent = countInlineContent(content);
    const dependencies = analyzeDependencies(content);
    
    // Calculate complexity score
    const complexityScore = (
      (inlineContent.inlineStyles.blocks * 3) +
      (inlineContent.inlineStyles.attributes * 1) +
      (inlineContent.inlineScripts.blocks * 2) +
      (lines / 100)
    );
    
    // Determine refactor priority
    let priority = 'Low';
    if (complexityScore > 50 || inlineContent.inlineStyles.blocks > 5) {
      priority = 'High';
    } else if (complexityScore > 20 || inlineContent.inlineStyles.blocks > 2) {
      priority = 'Medium';
    }
    
    return {
      file: relative(rootDir, filePath),
      title: pageInfo.title,
      lines,
      sizeKB: Math.round(size / 1024 * 100) / 100,
      meta: metaTags,
      inline: inlineContent,
      dependencies,
      mobile: {
        hasViewport: pageInfo.hasViewport,
        hasThemeColor: pageInfo.hasThemeColor,
        hasManifest: pageInfo.hasManifest
      },
      complexity: Math.round(complexityScore * 100) / 100,
      priority
    };
  } catch (error) {
    console.error(`Error analyzing ${filePath}:`, error.message);
    return null;
  }
}

/**
 * Find all HTML files in directory
 */
function findHTMLFiles(dir, files = []) {
  const items = readdirSync(dir);
  
  for (const item of items) {
    const fullPath = join(dir, item);
    const stat = statSync(fullPath);
    
    if (stat.isDirectory() && !item.startsWith('.') && item !== 'node_modules') {
      findHTMLFiles(fullPath, files);
    } else if (stat.isFile() && extname(item) === '.html') {
      files.push(fullPath);
    }
  }
  
  return files;
}

/**
 * Generate summary statistics
 */
function generateSummary(results) {
  const total = results.length;
  const totalLines = results.reduce((acc, r) => acc + r.lines, 0);
  const totalSize = results.reduce((acc, r) => acc + r.sizeKB, 0);
  
  const priorities = results.reduce((acc, r) => {
    acc[r.priority] = (acc[r.priority] || 0) + 1;
    return acc;
  }, {});
  
  const highComplexity = results.filter(r => r.complexity > 50).length;
  const hasInlineStyles = results.filter(r => r.inline.inlineStyles.blocks > 0).length;
  const hasMobileOptimization = results.filter(r => r.mobile.hasViewport).length;
  
  return {
    overview: {
      totalFiles: total,
      totalLines,
      totalSizeKB: Math.round(totalSize * 100) / 100,
      avgLinesPerFile: Math.round(totalLines / total),
      avgSizePerFile: Math.round(totalSize / total * 100) / 100
    },
    priorities,
    issues: {
      highComplexity,
      hasInlineStyles,
      needsMobileOptimization: total - hasMobileOptimization
    },
    recommendations: generateRecommendations(results)
  };
}

/**
 * Generate refactor recommendations
 */
function generateRecommendations(results) {
  const recommendations = [];
  
  // High priority files
  const highPriorityFiles = results.filter(r => r.priority === 'High');
  if (highPriorityFiles.length > 0) {
    recommendations.push({
      type: 'urgent',
      title: 'High Priority Refactoring',
      description: `${highPriorityFiles.length} files need immediate attention due to high complexity or extensive inline styles.`,
      files: highPriorityFiles.map(f => f.file)
    });
  }
  
  // Inline styles cleanup
  const filesWithInlineStyles = results.filter(r => r.inline.inlineStyles.blocks > 0);
  if (filesWithInlineStyles.length > 0) {
    recommendations.push({
      type: 'cleanup',
      title: 'Extract Inline Styles',
      description: `${filesWithInlineStyles.length} files have inline <style> blocks that should be extracted to external CSS.`,
      files: filesWithInlineStyles.map(f => f.file)
    });
  }
  
  // Mobile optimization
  const needsMobile = results.filter(r => !r.mobile.hasViewport);
  if (needsMobile.length > 0) {
    recommendations.push({
      type: 'mobile',
      title: 'Mobile Optimization',
      description: `${needsMobile.length} files are missing viewport meta tags for mobile optimization.`,
      files: needsMobile.map(f => f.file)
    });
  }
  
  // Large files
  const largeFiles = results.filter(r => r.lines > 500);
  if (largeFiles.length > 0) {
    recommendations.push({
      type: 'optimization',
      title: 'Large File Optimization',
      description: `${largeFiles.length} files exceed 500 lines and may benefit from component extraction.`,
      files: largeFiles.map(f => f.file)
    });
  }
  
  return recommendations;
}

/**
 * Main execution
 */
function main() {
  console.log('🔍 Analyzing HTML pages for UI refactor...\n');
  
  const htmlFiles = findHTMLFiles(rootDir);
  console.log(`Found ${htmlFiles.length} HTML files\n`);
  
  const results = htmlFiles
    .map(analyzeHTMLFile)
    .filter(Boolean)
    .sort((a, b) => b.complexity - a.complexity);
  
  const summary = generateSummary(results);
  
  const report = {
    timestamp: new Date().toISOString(),
    summary,
    pages: results
  };
  
  // Write JSON report
  const jsonPath = join(rootDir, 'ui-refactor-inventory.json');
  writeFileSync(jsonPath, JSON.stringify(report, null, 2));
  
  // Write human-readable report
  const readablePath = join(rootDir, 'ui-refactor-inventory.md');
  writeFileSync(readablePath, generateMarkdownReport(report));
  
  console.log('📊 Analysis complete!');
  console.log(`📄 JSON report: ${relative(process.cwd(), jsonPath)}`);
  console.log(`📖 Readable report: ${relative(process.cwd(), readablePath)}\n`);
  
  // Print quick summary
  console.log('📋 Quick Summary:');
  console.log(`   Total files: ${summary.overview.totalFiles}`);
  console.log(`   High priority: ${summary.priorities.High || 0}`);
  console.log(`   Medium priority: ${summary.priorities.Medium || 0}`);
  console.log(`   Low priority: ${summary.priorities.Low || 0}`);
  console.log(`   Files with inline styles: ${summary.issues.hasInlineStyles}`);
  console.log(`   Need mobile optimization: ${summary.issues.needsMobileOptimization}`);
}

/**
 * Generate markdown report
 */
function generateMarkdownReport(report) {
  const { summary, pages } = report;
  
  let md = `# UI Refactor Inventory Report\n\n`;
  md += `Generated: ${new Date(report.timestamp).toLocaleString()}\n\n`;
  
  md += `## Summary\n\n`;
  md += `- **Total Files**: ${summary.overview.totalFiles}\n`;
  md += `- **Total Lines**: ${summary.overview.totalLines.toLocaleString()}\n`;
  md += `- **Total Size**: ${summary.overview.totalSizeKB} KB\n`;
  md += `- **Average Lines/File**: ${summary.overview.avgLinesPerFile}\n`;
  md += `- **Average Size/File**: ${summary.overview.avgSizePerFile} KB\n\n`;
  
  md += `### Priority Distribution\n\n`;
  Object.entries(summary.priorities).forEach(([priority, count]) => {
    md += `- **${priority}**: ${count} files\n`;
  });
  md += `\n`;
  
  md += `### Issues Found\n\n`;
  md += `- **High Complexity**: ${summary.issues.highComplexity} files\n`;
  md += `- **Inline Styles**: ${summary.issues.hasInlineStyles} files\n`;
  md += `- **Missing Mobile Optimization**: ${summary.issues.needsMobileOptimization} files\n\n`;
  
  if (summary.recommendations.length > 0) {
    md += `## Recommendations\n\n`;
    summary.recommendations.forEach(rec => {
      md += `### ${rec.title}\n\n`;
      md += `${rec.description}\n\n`;
      if (rec.files.length <= 5) {
        rec.files.forEach(file => md += `- ${file}\n`);
      } else {
        rec.files.slice(0, 3).forEach(file => md += `- ${file}\n`);
        md += `- ... and ${rec.files.length - 3} more files\n`;
      }
      md += `\n`;
    });
  }
  
  md += `## Detailed Page Analysis\n\n`;
  md += `| File | Priority | Lines | Size (KB) | Inline Styles | Complexity |\n`;
  md += `|------|----------|-------|-----------|---------------|------------|\n`;
  
  pages.forEach(page => {
    md += `| ${page.file} | ${page.priority} | ${page.lines} | ${page.sizeKB} | ${page.inline.inlineStyles.blocks} | ${page.complexity} |\n`;
  });
  
  return md;
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}