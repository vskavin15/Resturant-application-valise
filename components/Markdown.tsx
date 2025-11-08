
import React from 'react';

const Markdown: React.FC<{ content: string }> = ({ content }) => {
    const lines = content.split('\n');
    // FIX: Replaced `JSX.Element` with `React.ReactElement` to resolve "Cannot find namespace 'JSX'" error.
    const elements: React.ReactElement[] = [];
    // FIX: Replaced `JSX.Element` with `React.ReactElement` to resolve "Cannot find namespace 'JSX'" error.
    let listItems: React.ReactElement[] = [];

    for (let i = 0; i < lines.length; i++) {
        let line = lines[i];
        
        // Sanitize to prevent basic XSS, although __html is always risky
        line = line.replace(/</g, "&lt;").replace(/>/g, "&gt;");
        
        // Bold text
        line = line.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');

        if (line.trim().startsWith('* ') || line.trim().startsWith('- ')) {
            const listItemContent = line.substring(line.search(/\S/) + 1).trim();
            listItems.push(<li key={i} dangerouslySetInnerHTML={{ __html: listItemContent }} />);
        } else {
            if (listItems.length > 0) {
                elements.push(<ul key={`ul-${i}`} className="list-disc list-inside space-y-1 my-2">{listItems}</ul>);
                listItems = [];
            }
            if (line.trim() !== '') {
                elements.push(<p key={i} dangerouslySetInnerHTML={{ __html: line }} />);
            }
        }
    }
    if (listItems.length > 0) {
        elements.push(<ul key="ul-last" className="list-disc list-inside space-y-1 my-2">{listItems}</ul>);
    }

    return <div className="prose dark:prose-invert max-w-none text-gray-700 dark:text-gray-300 space-y-3">{elements}</div>;
};

export default Markdown;