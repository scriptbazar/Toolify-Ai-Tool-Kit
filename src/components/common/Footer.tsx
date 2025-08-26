import React from 'react';

export default function Footer() {
  return (
    <footer className="border-t">
      <div className="container mx-auto px-4 py-6">
        <p className="text-center text-sm text-muted-foreground">
          &copy; {new Date().getFullYear()} ToolifyAI. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
