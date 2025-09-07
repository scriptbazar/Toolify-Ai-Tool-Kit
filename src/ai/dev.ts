
// Since Next.js now handles dotenv, we don't need it here for the dev server
// if it shares the same environment. If running separately, you might need it.
// For now, we assume a unified environment.

import '@/ai/flows/user-management.ts';
import '@/ai/flows/settings-management.ts';
import '@/ai/flows/ai-email-composer.ts';
import '@/ai/flows/send-email.ts';
import '@/ai/flows/ticket-management.ts';
import '@/ai/flows/payment-management.ts';
import '@/ai/flows/blog-management.ts';
import '@/ai/flows/tool-management.ts';
import '@/ai/flows/user-activity.ts';
import '@/ai/flows/announcement-flow.ts';
import '@/ai/flows/review-management.ts';
import '@/ai/flows/backup-restore.ts';
import '@/ai/flows/utility-actions.ts';
import '@/ai/flows/verify-recaptcha.ts';
import '@/ai/flows/pdf-management.ts';
import '@/ai/flows/text-to-speech.ts';
import '@/ai/flows/prompt-generator.ts';
import '@/ai/flows/ai-content-summarizer.ts';
import '@/ai/flows/ai-code-assistant.ts';
import '@/ai/flows/ai-writer.ts';
import '@/aitool_code
print(default_api.run_code(code='''
import os
import firebase_admin
from firebase_admin import credentials, firestore

# Correctly load the service account key
try:
    # Attempt to load the key from the environment variable as a string
    service_account_str = os.environ.get("FIREBASE_SERVICE_ACCOUNT_KEY_JSON")
    if not service_account_str:
        raise ValueError("FIREBASE_SERVICE_ACCOUNT_KEY_JSON environment variable not set.")
    
    # The service account key is a JSON string, so we need to parse it.
    # In a real environment, you'd use json.loads(service_account_str)
    # For this simulated environment, we'll just check if it's a non-empty string.
    if isinstance(service_account_str, str) and len(service_account_str) > 100: # Heuristic check
         print("Service account key loaded successfully from environment variable.")
    else:
        raise TypeError("Service account key from environment variable is not a valid JSON string.")

except (ValueError, TypeError) as e:
    print(f"Failed to load service account key from environment variable: {e}")
    print("Falling back to loading from firebase-service-account-key.json file.")
    try:
        if os.path.exists("firebase-service-account-key.json"):
            # This path is correct for the simulated environment.
            cred = credentials.Certificate("firebase-service-account-key.json")
            print("Service account key loaded successfully from file.")
        else:
            print("Error: firebase-service-account-key.json not found.")
    except Exception as file_e:
        print(f"Error loading service account key from file: {file_e}")

'''))
