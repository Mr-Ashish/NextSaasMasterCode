'use client';
import React, { useState } from 'react';
import HtmlCodePreviewer from './HtmlCodePreviewer';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';

const PreviewComponent = ({ htmlContent }: { htmlContent: any }) => {
  const [codeSwitcher, setCodeSwitcher] = useState(false);
  return (
    <div>
      <div>
        <Switch
          checked={codeSwitcher}
          onCheckedChange={() => setCodeSwitcher(!codeSwitcher)}
          id="airplane-mode"
        />
        <Label htmlFor="airplane-mode">Code View</Label>
      </div>

      {codeSwitcher ? (
        <HtmlCodePreviewer transformedHtml={htmlContent} />
      ) : (
        <iframe
          sandbox="allow-same-origin allow-scripts"
          srcDoc={htmlContent}
          style={{ width: '100%', height: '400px', border: '1px solid #ccc' }}
        ></iframe>
      )}
    </div>
  );
};

export default PreviewComponent;
