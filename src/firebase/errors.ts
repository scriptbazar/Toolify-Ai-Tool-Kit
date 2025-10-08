'use client';

export type SecurityRuleContext = {
  path: string;
  operation: 'get' | 'list' | 'create' | 'update' | 'delete' | 'write';
  requestResourceData?: any;
};

export class FirestorePermissionError extends Error {
  public context: SecurityRuleContext;
  public serverError: any;

  constructor(context: SecurityRuleContext, serverError?: any) {
    const deniedMessage = `FirestoreError: Missing or insufficient permissions: The following request was denied by Firestore Security Rules:\n${JSON.stringify({
      operation: context.operation,
      path: context.path,
      requestData: context.requestResourceData,
    }, null, 2)}`;
    
    super(deniedMessage);
    this.name = 'FirestorePermissionError';
    this.context = context;
    this.serverError = serverError;

    // This is for V8's stack trace API
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, FirestorePermissionError);
    }
  }
}
