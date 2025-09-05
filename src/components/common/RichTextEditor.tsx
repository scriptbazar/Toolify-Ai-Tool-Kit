
'use client';

import React from 'react';
import 'react-quill/dist/quill.snow.css';
import dynamic from 'next/dynamic';

const ReactQuill = dynamic(
  async () => {
    const { default: RQ } = await import('react-quill');
    // The type for forwardedRef is complex, so we use 'any' here for simplicity.
    // The forwardRef wrapper will handle the types correctly.
    // eslint-disable-next-line react/display-name
    return ({ forwardedRef, ...props }: { forwardedRef: any; [key: string]: any }) => (
      <RQ ref={forwardedRef} {...props} />
    );
  },
  { ssr: false }
);

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

export function RichTextEditor({ value, onChange, placeholder, className }: RichTextEditorProps) {
  const modules = {
    toolbar: [
      [{ 'header': [1, 2, 3, false] }],
      ['bold', 'italic', 'underline', 'strike'],
      [{'list': 'ordered'}, {'list': 'bullet'}, {'indent': '-1'}, {'indent': '+1'}],
      ['link'],
      [{ 'align': [] }],
      ['clean']
    ],
  };

  const formats = [
    'header',
    'bold', 'italic', 'underline', 'strike',
    'list', 'bullet', 'indent',
    'link',
    'align',
  ];

  return (
    <div className={className}>
      <ReactQuill
        theme="snow"
        value={value}
        onChange={onChange}
        modules={modules}
        formats={formats}
        placeholder={placeholder}
      />
    </div>
  );
}
