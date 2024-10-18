'use client';
import React, { useState } from 'react';
import PreviewComponent from './PreviewComponent';
import transformHtml from '../../../app/api/(validator)/validator-upload/utils';
import { Button } from '@/app/ui/button';

const TransformAndPreview = ({ sanitizedHtml }: { sanitizedHtml: any }) => {
  const [transformedHtml, setTransformedHtml] = useState('');

  const handleTransform = () => {
    const result = transformHtml(sanitizedHtml);
    setTransformedHtml(result);
  };

  return (
    <div>
      {/* <h2>Transformed HTML Preview</h2> */}
      <Button onClick={handleTransform}>Transform HTML</Button>
      {transformedHtml && <PreviewComponent htmlContent={transformedHtml} />}
    </div>
  );
};

export default TransformAndPreview;
