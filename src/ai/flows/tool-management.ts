

'use server';

/**
 * @fileOverview Manages tools in Firestore.
 */
import { getAdminDb } from '@/lib/firebase-admin';
import { FieldValue, Timestamp } from 'firebase-admin/firestore';
import { type Tool, ToolSchema, UpsertToolInputSchema, type ToolRequest, ToolRequestSchema } from './tool-management.types';
import { z } from 'zod';

const TOOLS_COLLECTION = 'tools';
const TOOL_REQUESTS_COLLECTION = 'toolRequests';

const initialTools: Omit<Tool, 'id' | 'slug' | 'createdAt'>[] = [
    { name: 'Word Counter', description: 'Count words, characters, sentences, paragraphs, and reading time for any text to meet your writing requirements.', icon: 'Calculator', category: 'text', plan: 'Free', isNew: false, isToolOfTheWeek: false, status: 'Active', howToUse: ['Paste or type your text into the text area.', 'The tool will instantly display the word, character, sentence, and paragraph counts.', 'Review the metrics provided below the text area.'] },
    { name: 'Lorem Ipsum Generator', description: 'Generate customizable placeholder text in various lengths and formats for your design and development projects.', icon: 'FileText', category: 'text', plan: 'Free', isNew: false, isToolOfTheWeek: false, status: 'Active', howToUse: ['Select the type of text to generate (paragraphs, sentences, or words).', 'Enter the amount you wish to generate.', 'Click the "Generate" button to see the result.'] },
    { name: 'Password Generator', description: 'Create strong, secure, and highly customizable passwords with options for length, characters, and complexity.', icon: 'KeyRound', category: 'dev', plan: 'Free', isNew: false, isToolOfTheWeek: false, status: 'Active', howToUse: ['Adjust the slider to set your desired password length.', 'Use the checkboxes to include or exclude uppercase, lowercase, numbers, and symbols.', 'Click the "Refresh" icon to generate a new password.', 'Click the "Copy" icon to copy the password to your clipboard.'] },
    { name: 'JSON Formatter', description: 'Format, validate, and beautify your JSON data for improved readability and easier debugging.', icon: 'Braces', category: 'dev', plan: 'Free', isNew: false, isToolOfTheWeek: false, status: 'Active', howToUse: ['Paste your raw JSON data into the text area.', 'Click the "Validate & Format" button.', 'The tool will automatically beautify the JSON and show a validation status.', 'Copy the formatted JSON to your clipboard.'] },
    { name: 'BMI Calculator', description: 'Calculate your Body Mass Index (BMI) to quickly assess your weight status and overall health.', icon: 'HeartPulse', category: 'calculator', plan: 'Free', isNew: false, isToolOfTheWeek: false, status: 'Active', howToUse: ['Select your preferred unit system (Metric or Imperial).', 'Enter your height and weight in the respective fields.', 'Click the "Calculate BMI" button.', 'View your calculated BMI and corresponding health category.'] },
    { name: 'Text to Speech', description: 'Convert written text into natural-sounding spoken audio in a variety of voices and languages.', icon: 'Volume2', category: 'ai', plan: 'Pro', isNew: true, isToolOfTheWeek: false, status: 'Active', howToUse: ['Enter the text you want to convert into the text area.', 'Select the desired voice gender and model.', 'Click the "Generate Audio" button.', 'Listen to the generated audio directly on the page.'] },
    { name: 'Speech to Text', description: 'Accurately transcribe audio files and spoken words into written text with our advanced speech recognition tool.', icon: 'Voicemail', category: 'ai', plan: 'Pro', isNew: true, isToolOfTheWeek: false, status: 'Active', howToUse: ['Upload your audio or video file (MP3, WAV, MP4, etc.).', 'Click the "Transcribe Audio" button.', 'Wait for the AI to process the file.', 'The transcribed text will appear in the text box below.'] },
    { name: 'PDF Merger', description: 'Combine multiple PDF files into a single, organized document, perfect for reports and presentations.', icon: 'FilePlus2', category: 'pdf', plan: 'Pro', isNew: false, isToolOfTheWeek: false, status: 'Active', howToUse: ['Upload two or more PDF files you want to merge.', 'Optionally, specify page ranges for each file (e.g., "1-3, 5").', 'Click the "Merge and Download" button.', 'Your combined PDF will be automatically downloaded.'] },
    { name: 'Unlock PDF', description: 'Easily remove password protection and restrictions from your PDF files to allow editing and printing.', icon: 'Unlock', category: 'pdf', plan: 'Pro', isNew: true, isToolOfTheWeek: false, status: 'Active', howToUse: ['Upload the password-protected PDF file.', 'Enter the current password for the PDF.', 'Click the "Unlock PDF" button.', 'Download the restriction-free PDF file.'] },
    { name: 'Lock PDF', description: 'Protect your sensitive PDF files with a strong password and set permissions for printing, copying, and editing.', icon: 'Lock', category: 'pdf', plan: 'Pro', isNew: true, isToolOfTheWeek: false, status: 'Active', howToUse: ['Upload the PDF file you want to protect.', 'Enter a strong password to encrypt the file.', 'Optionally, set permissions for printing, copying, etc.', 'Click "Lock PDF" to download the secured file.'] },
    { name: 'Unit Converter', description: 'Convert between various units of measurement for length, mass, temperature, and more with this versatile tool.', icon: 'Ruler', category: 'calculator', plan: 'Free', isNew: false, isToolOfTheWeek: false, status: 'Active', howToUse: ['Select the type of conversion (e.g., Length, Mass).', 'Enter the value you want to convert in the "From" field.', 'Select the "From" and "To" units from the dropdown menus.', 'The converted value will automatically appear in the "To" field.'] },
    { name: 'Color Picker', description: 'Pick colors from an interactive color wheel or your screen to get HEX, RGB, and HSL codes instantly.', icon: 'Pipette', category: 'image', plan: 'Free', isNew: false, isToolOfTheWeek: false, status: 'Active', howToUse: ['Use the color wheel to select your desired color.', 'Alternatively, click the color swatch to use your browser\'s native color picker.', 'The corresponding HEX, RGB, and HSL values will be displayed.', 'Click the "Copy" button next to any value to copy it.'] },
    { name: 'Text Repeater', description: 'Repeat a piece of text multiple times with optional new lines, perfect for testing or creative purposes.', icon: 'Repeat', category: 'text', plan: 'Free', isNew: false, isToolOfTheWeek: false, status: 'Active', howToUse: ['Enter the text you want to repeat.', 'Specify the number of repetitions.', 'Choose whether to add a new line after each repetition.', 'Click "Repeat Text" to see the result.'] },
    { name: 'Prompt Generator', description: 'Generate creative and detailed prompts for AI models based on your topic to get better results.', icon: 'Lightbulb', category: 'ai', plan: 'Free', isNew: true, isToolOfTheWeek: false, status: 'Active', howToUse: ['Enter a simple topic or a few keywords.', 'Select a category (e.g., Image, Website, Creative Writing).', 'Choose the desired style and level of detail.', 'Click "Generate Advanced Prompt" to get a comprehensive prompt.'] },
    { name: 'AI Blog Post Writer', description: 'Generate a complete, SEO-friendly blog post on any topic, complete with headings and paragraphs.', icon: 'PenSquare', category: 'ai', plan: 'Pro', isNew: true, isToolOfTheWeek: false, status: 'Active', howToUse: ['Enter the topic of your blog post.', 'Select the desired length, tone, and language.', 'Click "Generate Post".', 'The AI will write a complete blog post, which you can preview and copy.'] },
    { name: 'AI Content Summarizer', description: 'Summarize long articles, documents, or complex texts into concise, easy-to-read key points.', icon: 'AlignLeft', category: 'ai', plan: 'Pro', isNew: true, isToolOfTheWeek: false, status: 'Active', howToUse: ['Paste the text you want to summarize into the input box.', 'Choose your desired summary format (Short, Medium, or Detailed).', 'Click the "Summarize" button.', 'The AI-generated summary will appear in the output box.'] },
    { name: 'AI Code Assistant', description: 'Get expert help with writing, debugging, and explaining code snippets in any programming language.', icon: 'Code', category: 'ai', plan: 'Pro', isNew: true, isToolOfTheWeek: false, status: 'Active', howToUse: ['Select the programming language.', 'Choose the action you want to perform (Generate, Debug, Explain, or Minify).', 'Enter your code or instructions in the text area.', 'Click "Execute" to get the AI-generated response.'] },
    { name: 'AI Email Composer', description: 'Generate professional and effective emails for various purposes based on your provided key points and tone.', icon: 'Mail', category: 'ai', plan: 'Pro', isNew: true, isToolOfTheWeek: false, status: 'Active', howToUse: ['Enter the subject of your email.', 'Select the desired tone of voice.', 'List the key points or message you want to convey.', 'Click "Generate Email" to get a complete email body drafted by AI.'] },
    { name: 'AI Image Generator', description: 'Create stunning, unique, and high-quality images from simple text descriptions using advanced AI models.', icon: 'ImageIcon', category: 'ai', plan: 'Pro', isNew: true, isToolOfTheWeek: false, status: 'Active', howToUse: ['Write a descriptive prompt of the image you want to create.', 'Click the "Generate Image" button.', 'The AI will generate an image based on your prompt.', 'You can then download the generated image.'] },
    { name: 'AI Product Description Writer', description: 'Craft persuasive and engaging descriptions for your e-commerce products to boost sales and SEO.', icon: 'ShoppingCart', category: 'ai', plan: 'Pro', isNew: true, isToolOfTheWeek: false, status: 'Active', howToUse: ['Enter the name of your product.', 'Describe the target audience.', 'Select the desired tone and format.', 'Click "Generate Description" to get SEO-friendly copy.'] },
    { name: 'AI Story Generator', description: 'Craft compelling and imaginative short stories in various genres from a simple prompt or topic.', icon: 'BookOpen', category: 'ai', plan: 'Pro', isNew: true, isToolOfTheWeek: false, status: 'Active', howToUse: ['Enter a topic or a short prompt for your story.', 'Choose the genre and language.', 'Click the "Generate Story" button.', 'The AI will write a complete story for you.'] },
    { name: 'AI Tweet Generator', description: 'Generate engaging tweets and thread ideas for your social media, complete with relevant hashtags.', icon: 'Twitter', category: 'ai', plan: 'Pro', isNew: true, isToolOfTheWeek: false, status: 'Active', howToUse: ['Enter the topic you want to tweet about.', 'Select the desired tone for your tweet.', 'Click "Generate Tweet".', 'The AI will create a tweet with relevant hashtags, ready to be posted.'] },
    { name: 'AI Voice Cloning', description: 'Create a digital clone of your voice from a short audio sample and generate speech in your own accent.', icon: 'Voicemail', category: 'ai', plan: 'Pro', isNew: true, isToolOfTheWeek: false, status: 'Active', howToUse: ['Upload a clear audio sample of your voice (MP3, WAV, etc.).', 'Enter the text you want the cloned voice to speak.', 'Click "Generate Speech".', 'Listen to the audio generated in your own voice.'] },
    { name: 'AI Story Visualizer', description: 'Analyze your story scene-by-scene and generate powerful, descriptive image prompts for each visual moment.', icon: 'Clapperboard', category: 'ai', plan: 'Pro', isNew: true, isToolOfTheWeek: false, status: 'Active', howToUse: ['Paste your story or a chapter into the text area.', 'Click "Generate Scene Prompts".', 'The AI will break down your story into scenes and create detailed image prompts for each one.', 'Copy the prompts to use in an AI image generator.'] },
    { name: 'AI Code Generator', description: 'Generate high-quality code snippets in any language with detailed setup instructions and explanations.', icon: 'Terminal', category: 'ai', plan: 'Pro', isNew: true, isToolOfTheWeek: false, status: 'Active', howToUse: ['Describe what you want to build with code.', 'Select the programming language.', 'Click "Generate Code".', 'The AI will provide the code, setup instructions, and a detailed explanation.'] },
    { name: 'AI Rewriter', description: 'Rewrite your text to improve clarity, change the tone, fix grammar, or adjust the length as needed.', icon: 'FilePenLine', category: 'ai', plan: 'Pro', isNew: true, isToolOfTheWeek: false, status: 'Active', howToUse: ['Paste your original text into the input box.', 'Select your goal (e.g., Improve Clarity, Make it Formal).', 'Click the "Rewrite" button.', 'The rewritten text will appear in the output box.'] },
    { name: 'Add Watermark to PDF', description: 'Add a text or image watermark to your PDF documents to protect and brand your files.', icon: 'Fingerprint', category: 'pdf', plan: 'Pro', isNew: true, isToolOfTheWeek: false, status: 'Active', howToUse: ['Upload the PDF file you want to watermark.', 'Choose between a text or image watermark.', 'Configure the watermark\'s text/image, opacity, size, and rotation.', 'Click "Apply Watermark & Download" to get your protected PDF.'] },
    { name: 'Age Calculator', description: 'Calculate your exact age in years, months, and days from your date of birth instantly.', icon: 'Gift', category: 'calculator', plan: 'Free', isNew: false, isToolOfTheWeek: false, status: 'Active', howToUse: ['Select your date of birth using the calendar.', 'The tool will automatically calculate and display your age in years, months, and days.', 'It will also show how many days are left until your next birthday.'] },
    { name: 'Amazon Shipping Label Cropper', description: 'Effortlessly crop Amazon FBA labels from 8.5x11 inch to a perfect 4x6 inch format for thermal printers.', icon: 'FileUp', category: 'ecommerce', plan: 'Free', isNew: true, isToolOfTheWeek: false, status: 'Active', howToUse: ['Upload the standard 8.5" x 11" PDF label from Amazon Seller Central.', 'Click the "Crop Label and Download" button.', 'A new PDF with two 4" x 6" labels will be automatically downloaded.'] },
    { name: 'Myntra Shipping Label Cropper', description: 'Quickly convert your standard Myntra shipping labels into a thermal printer-friendly 4x6 inch format.', icon: 'Crop', category: 'ecommerce', plan: 'Free', isNew: true, isToolOfTheWeek: false, status: 'Active', howToUse: ['Upload the standard PDF label from Myntra.', 'Click the "Crop Myntra Label" button.', 'A new PDF with a 4" x 6" label will be downloaded.'] },
    { name: 'Flipkart Shipping Label Cropper', description: 'Crop your Flipkart shipping labels from a full page to a 4x6 inch size in seconds, ideal for thermal printing.', icon: 'Crop', category: 'ecommerce', plan: 'Free', isNew: true, isToolOfTheWeek: false, status: 'Active', howToUse: ['Upload the standard PDF label from Flipkart.', 'Click the "Crop Flipkart Label" button.', 'A new PDF with a 4" x 6" label will be downloaded.'] },
    { name: 'Meesho Shipping Label Cropper', description: 'Optimize your Meesho shipping process by cropping default labels to a 4x6 inch format for your thermal printer.', icon: 'Crop', category: 'ecommerce', plan: 'Free', isNew: true, isToolOfTheWeek: false, status: 'Active', howToUse: ['Upload the standard PDF label from Meesho.', 'Click the "Crop Meesho Label" button.', 'A new PDF with a 4" x 6" label will be downloaded.'] },
    { name: 'Base64 Converter', description: 'Encode your text and data into Base64 format or decode Base64 strings back to their original form.', icon: 'Package', category: 'dev', plan: 'Free', isNew: true, isToolOfTheWeek: false, status: 'Active', howToUse: ['Enter text in the input box.', 'Click "Encode" to convert it to Base64.', 'Alternatively, paste a Base64 string in the input box and click "Decode".', 'Use the "Swap" button to switch between input and output.'] },
    { name: 'Binary to Text', description: 'Convert binary code into readable ASCII text.', icon: 'Binary', category: 'dev', plan: 'Free', isNew: true, isToolOfTheWeek: false, status: 'Active', howToUse: ['Enter the binary code (e.g., 01001000 01100101 01101100 01101100 01101111) in the input area.', 'Click the "Convert to Text" button.', 'The corresponding ASCII text will appear in the output area.'] },
    { name: 'Text to Binary', description: 'Convert any text into binary code format.', icon: 'Binary', category: 'dev', plan: 'Free', isNew: true, isToolOfTheWeek: false, status: 'Active', howToUse: ['Enter the text you want to convert into the input area.', 'Click the "Convert to Binary" button.', 'The binary representation of your text will be displayed.'] },
    { name: 'CSS Minifier', description: 'Minify your CSS code to reduce file size, remove comments, and improve your website\'s loading times.', icon: 'FileCode', category: 'dev', plan: 'Free', isNew: true, isToolOfTheWeek: false, status: 'Active', howToUse: ['Paste your CSS code into the "Original CSS" box.', 'Click the "Minify CSS" button.', 'The minified code will appear in the "Minified CSS" box.', 'Click "Copy" to use the minified code.'] },
    { name: 'Discount Calculator', description: 'Easily calculate the final price after a discount and see exactly how much money you save.', icon: 'BadgePercent', category: 'calculator', plan: 'Free', isNew: true, isToolOfTheWeek: false, status: 'Active', howToUse: ['Enter the original price of the item.', 'Enter the discount percentage.', 'Click the "Calculate" button.', 'View the final price and the amount you saved.'] },
    { name: 'Date Calculator', description: 'Calculate the duration between two dates or find a future/past date by adding or subtracting days, months, and years.', icon: 'CalendarDays', category: 'calculator', plan: 'Free', isNew: true, isToolOfTheWeek: false, status: 'Active', howToUse: ['Select the "Add/Subtract" or "Duration" tab.', 'For Add/Subtract: Pick a start date and enter the years, months, or days to add or subtract.', 'For Duration: Pick a start and end date.', 'Click the appropriate button to see the calculated result.'] },
    { name: 'Compress PDF', description: 'Reduce the file size of your PDF documents without sacrificing quality, making them easier to share.', icon: 'FileArchive', category: 'pdf', plan: 'Pro', isNew: true, isToolOfTheWeek: false, status: 'Active', howToUse: ['Upload the PDF file you want to compress.', 'Select the desired compression level (e.g., Low, Medium, High).', 'Click the "Compress PDF" button.', 'Download the optimized, smaller PDF file.'] },
    { name: 'Excel to PDF', description: 'Convert your Microsoft Excel spreadsheets (.xls, .xlsx) into professional-looking PDF documents.', icon: 'FileSpreadsheet', category: 'pdf', plan: 'Free', isNew: true, isToolOfTheWeek: false, status: 'Active', howToUse: ['Upload your Excel file (.xls or .xlsx).', 'Adjust any optional settings like page orientation or scale.', 'Click the "Convert to PDF" button.', 'Download your newly created PDF file.'] },
    { name: 'Reverse Text', description: 'Reverse your text in various ways, including reversing all characters, reversing words only, or reversing letter order in words.', icon: 'ArrowLeftRight', category: 'text', plan: 'Free', isNew: true, isToolOfTheWeek: false, status: 'Active', howToUse: ['Paste your text into the text area.', 'Click the button for the type of reversal you want (e.g., Reverse Text, Reverse Words).', 'The text in the box will be instantly updated.'] },
    { name: 'Remove Extra Spaces', description: 'Clean up your text by automatically removing unnecessary spaces, tabs, and line breaks.', icon: 'Eraser', category: 'text', plan: 'Free', isNew: true, isToolOfTheWeek: false, status: 'Active', howToUse: ['Paste your text into the "Original Text" box.', 'Optionally, check the box to also remove line breaks.', 'Click "Remove Extra Spaces".', 'The cleaned text will appear in the "Cleaned Text" box.'] },
    { name: 'Find and Replace', description: 'Quickly find and replace specific words or phrases within a body of text with case-sensitive options.', icon: 'SearchCode', category: 'text', plan: 'Free', isNew: true, isToolOfTheWeek: false, status: 'Active', howToUse: ['Paste your text into the main text area.', 'Enter the word or phrase to find in the "Find" field.', 'Enter the new word or phrase in the "Replace With" field.', 'Click "Find & Replace All" to modify the text.'] },
    { name: 'Random Word Generator', description: 'Generate random words for creative writing, brainstorming sessions, games, or vocabulary practice.', icon: 'Shuffle', category: 'text', plan: 'Free', isNew: true, isToolOfTheWeek: false, status: 'Active', howToUse: ['Enter the number of random words you want to generate.', 'Click the "Generate Words" button.', 'A list of random words will appear in the text box below.'] },
    { name: 'Rotate Image', description: 'Rotate an image by 90, 180, or 270 degrees to get the perfect orientation for your needs.', icon: 'RotateCw', category: 'image', plan: 'Free', isNew: true, isToolOfTheWeek: false, status: 'Active', howToUse: ['Upload the image you want to rotate.', 'Click "Rotate Left" or "Rotate Right" to adjust the orientation.', 'Click "Download Rotated Image" to save your result.'] },
    { name: 'PNG to JPG', description: 'Convert your PNG images to the universally compatible JPG format, with options to control quality.', icon: 'FileImage', category: 'image', plan: 'Free', isNew: true, isToolOfTheWeek: false, status: 'Active', howToUse: ['Upload your PNG image file.', 'Click the "Convert to JPG & Download" button.', 'Your new JPG file will be automatically downloaded.'] },
    { name: 'JPG to PNG', description: 'Convert your JPG images to the PNG format, perfect for when you need transparency support.', icon: 'FileImage', category: 'image', plan: 'Free', isNew: true, isToolOfTheWeek: false, status: 'Active', howToUse: ['Upload your JPG or JPEG image file.', 'Click the "Convert to PNG & Download" button.', 'Your new PNG file will be automatically downloaded.'] },
    { name: 'Image to Base64', description: 'Convert an image file into a Base64 string that can be easily embedded in HTML or CSS.', icon: 'Code', category: 'image', plan: 'Free', isNew: true, isToolOfTheWeek: false, status: 'Active', howToUse: ['Upload the image file you want to convert.', 'The Base64 data URI will automatically appear in the text box.', 'Click the "Copy" button to copy the Base64 string.'] },
    { name: 'Image Resizer', description: 'Resize your images by specifying new dimensions in pixels or by a percentage of the original size.', icon: 'Scaling', category: 'image', plan: 'Free', isNew: true, isToolOfTheWeek: false, status: 'Active', howToUse: ['Upload the image you want to resize.', 'Enter the new width or height in pixels.', 'Check "Maintain aspect ratio" to avoid distortion.', 'Click "Resize & Download" to save your new image.'] },
    { name: 'Image Background Remover', description: 'Automatically remove the background from any image with a single click using advanced AI.', icon: 'Scissors', category: 'ai', plan: 'Pro', isNew: true, isToolOfTheWeek: false, status: 'Active', howToUse: ['Upload an image with a clear subject (person, object, etc.).', 'Click the "Remove Background" button.', 'The AI will process the image and provide a version with a transparent background.', 'Click "Download" to save the result as a PNG file.'] },
    { name: 'AdMob Revenue Calculator', description: 'Estimate your potential AdMob earnings based on DAU, impressions, eCPM, and other key metrics.', icon: 'Calculator', category: 'calculator', plan: 'Free', isNew: true, isToolOfTheWeek: false, status: 'Active', howToUse: ['Enter your Daily Active Users (DAU).', 'Provide your ad impressions per DAU and average eCPM.', 'Adjust the match rate and show rate percentages.', 'Click "Calculate Revenue" to see your daily, monthly, and yearly estimates.'] },
    { name: 'AdSense Revenue Calculator', description: 'Estimate your potential AdSense earnings based on page views, Click-Through Rate (CTR), and Cost Per Click (CPC).', icon: 'Calculator', category: 'calculator', plan: 'Free', isNew: true, isToolOfTheWeek: false, status: 'Active', howToUse: ['Enter your daily page views.', 'Provide your average Click-Through Rate (CTR) percentage.', 'Enter your average Cost Per Click (CPC) in dollars.', 'Click "Calculate Revenue" to see your estimated daily, monthly, and yearly earnings.'] },
    { name: 'IFSC Code to Bank Details', description: 'Get complete bank branch details instantly from an Indian Financial System Code (IFSC).', icon: 'Banknote', category: 'dev', plan: 'Free', isNew: true, isToolOfTheWeek: false, status: 'Active', howToUse: ['Enter a valid 11-character IFSC code.', 'Click the "Find Bank Details" button.', 'The tool will display the bank name, branch, address, and other available details.'] },
    { name: 'GST Calculator', description: 'Calculate the Goods and Services Tax (GST) for any amount with customizable tax slabs.', icon: 'Calculator', category: 'calculator', plan: 'Free', isNew: true, isToolOfTheWeek: false, status: 'Active', howToUse: ['Enter the base amount.', 'Select whether to add or remove GST.', 'Choose the correct GST slab (e.g., 5%, 12%, 18%, 28%).', 'The calculator will show the GST amount and the final price.'] },
    { name: 'Image Color Extractor', description: 'Extract a complete color palette from an uploaded image to use in your design projects.', icon: 'Pipette', category: 'image', plan: 'Free', isNew: true, isToolOfTheWeek: false, status: 'Active', howToUse: ['Upload an image from your device.', 'The tool will analyze the image and display a palette of its most dominant colors.', 'Click on any color swatch to copy its HEX, RGB, or HSL code.'] },
    { name: 'Image Cropper', description: 'Crop your images to your desired dimensions with an easy-to-use visual cropping tool.', icon: 'Crop', category: 'image', plan: 'Free', isNew: true, isToolOfTheWeek: false, status: 'Active', howToUse: ['Upload the image you want to crop.', 'Drag the corners of the selection box to define your crop area.', 'Click the "Crop Image" button.', 'Download your newly cropped image.'] },
    { name: 'Image Compressor', description: 'Reduce the file size of your JPG and PNG images while maintaining the best possible quality.', icon: 'FileArchive', category: 'image', plan: 'Pro', isNew: true, isToolOfTheWeek: false, status: 'Active', howToUse: ['Upload a JPG or PNG image.', 'Use the slider to adjust the desired compression quality (e.g., 80%).', 'Click "Compress & Download".', 'Your optimized image will be downloaded.'] },
    { name: 'Image Text Extractor', description: 'Extract all text from an image using Optical Character Recognition (OCR) technology.', icon: 'ScanText', category: 'ai', plan: 'Pro', isNew: true, isToolOfTheWeek: false, status: 'Active', howToUse: ['Upload an image containing text (e.g., a photo of a document or a sign).', 'Click the "Extract Text" button.', 'The AI will analyze the image and display the recognized text.', 'You can then copy the extracted text.'] },
    { name: 'Image Converter', description: 'Convert your images between a wide variety of formats like PNG, JPG, WEBP, and more.', icon: 'FileImage', category: 'image', plan: 'Free', isNew: true, isToolOfTheWeek: false, status: 'Active', howToUse: ['Upload your source image file.', 'Select the desired output format (e.g., PNG, JPG, WEBP).', 'Click the "Convert & Download" button.', 'Your new image file will be automatically downloaded.'] },
    { name: 'Image to PDF', description: 'Convert your JPG, PNG, and other image files into a single, easy-to-share PDF document.', icon: 'FileImage', category: 'pdf', plan: 'Free', isNew: true, isToolOfTheWeek: false, status: 'Active', howToUse: ['Upload one or more image files (JPG, PNG, etc.).', 'Drag and drop to reorder the images if needed.', 'Click the "Convert to PDF" button.', 'Download the combined PDF document.'] },
    { name: 'PDF Signer', description: 'Sign your PDF documents electronically by drawing your signature or uploading an image of it.', icon: 'PenSquare', category: 'pdf', plan: 'Pro', isNew: true, isToolOfTheWeek: false, status: 'Active', howToUse: ['Upload the PDF document you need to sign.', 'Choose to draw your signature, type it, or upload an image of it.', 'Place your signature on the desired location in the document.', 'Click "Apply & Download" to save the signed PDF.'] },
    { name: 'Rotate PDF', description: 'Rotate all pages or specific pages in your PDF document to the correct orientation.', icon: 'RotateCw', category: 'pdf', plan: 'Pro', isNew: true, isToolOfTheWeek: false, status: 'Active', howToUse: ['Upload your PDF file.', 'Select whether to rotate all pages or specific pages.', 'Choose the rotation angle (90, 180, or 270 degrees).', 'Click "Rotate & Download" to get the updated PDF.'] },
    { name: 'Marks to Percentage Calculator', description: 'Convert your exam marks or grades into a standardized percentage score quickly and easily.', icon: 'Calculator', category: 'calculator', plan: 'Free', isNew: true, isToolOfTheWeek: false, status: 'Active', howToUse: ['Enter the marks you obtained.', 'Enter the total possible marks for the exam.', 'Click "Calculate Percentage".', 'The tool will display your percentage score.'] },
    { name: 'SRM to CGPA Calculator', description: 'Calculate your Cumulative Grade Point Average (CGPA) specifically for SRM University students.', icon: 'Calculator', category: 'calculator', plan: 'Free', isNew: true, isToolOfTheWeek: false, status: 'Active', howToUse: ['Enter your grades and credits for each subject, semester by semester.', 'The tool will use SRM\'s specific grading system to calculate your CGPA.', 'View your semester-wise and cumulative GPA.'] },
    { name: 'CGPA to Marks Calculator', description: 'Convert your CGPA score into an equivalent total marks or percentage based on your university\'s formula.', icon: 'Calculator', category: 'calculator', plan: 'Free', isNew: true, isToolOfTheWeek: false, status: 'Active', howToUse: ['Enter your CGPA.', 'Select your university or enter the conversion formula (e.g., Percentage = CGPA * 9.5).', 'Click "Convert".', 'The tool will show your equivalent percentage or marks.'] },
    { name: 'GPA to Percentage Converter', description: 'Convert your Grade Point Average (GPA) into a percentage to understand your academic standing.', icon: 'Calculator', category: 'calculator', plan: 'Free', isNew: true, isToolOfTheWeek: false, status: 'Active', howToUse: ['Enter your GPA score.', 'Enter the maximum GPA scale (e.g., 4.0 or 10.0).', 'Click "Convert to Percentage".', 'Your equivalent percentage will be displayed.'] },
    { name: 'GPA to CGPA Calculator', description: 'Calculate your Cumulative Grade Point Average (CGPA) from your semester-wise or yearly GPA scores.', icon: 'Calculator', category: 'calculator', plan: 'Free', isNew: true, isToolOfTheWeek: false, status: 'Active', howToUse: ['Enter your GPA and total credits for each semester.', 'Click "Calculate CGPA".', 'The tool will show your overall CGPA based on the provided data.'] },
    { name: 'Percentage to CGPA Converter', description: 'Convert your overall percentage into a CGPA score on various scales (e.g., 4.0, 10.0).', icon: 'Calculator', category: 'calculator', plan: 'Free', isNew: true, isToolOfTheWeek: false, status: 'Active', howToUse: ['Enter your total percentage.', 'Select the target CGPA scale (e.g., 10-point scale).', 'Click "Convert to CGPA".', 'Your equivalent CGPA will be displayed.'] },
    { name: 'CGPA to GPA Converter', description: 'Convert your Cumulative Grade Point Average (CGPA) back to a standard GPA score.', icon: 'Calculator', category: 'calculator', plan: 'Free', isNew: true, isToolOfTheWeek: false, status: 'Active', howToUse: ['Enter your CGPA score.', 'Enter the scale of your CGPA (e.g., 10.0).', 'Select the target GPA scale (e.g., 4.0).', 'The tool will convert the score for you.'] },
    { name: 'PDF Splitter', description: 'Split a large PDF file into multiple smaller files or extract a specific range of pages into a new document.', icon: 'Split', category: 'pdf', plan: 'Pro', isNew: true, isToolOfTheWeek: false, status: 'Active', howToUse: ['Upload your large PDF file.', 'Choose your split option: split into single pages or extract a specific page range.', 'Enter the page numbers if needed (e.g., "5-10").', 'Click "Split PDF" to download your new file(s).'] },
    { name: 'PDF Page Reorder', description: 'Visually rearrange the pages of your PDF document into a new order with a simple drag-and-drop interface.', icon: 'Shuffle', category: 'pdf', plan: 'Pro', isNew: true, isToolOfTheWeek: false, status: 'Active', howToUse: ['Upload your PDF file.', 'Thumbnails of all pages will be displayed.', 'Drag and drop the page thumbnails into your desired new order.', 'Click "Save & Download" to get the reordered PDF.'] },
    { name: 'PDF Page Counter', description: 'Quickly and accurately count the total number of pages in any PDF file without opening it.', icon: 'ListOrdered', category: 'pdf', plan: 'Free', isNew: true, isToolOfTheWeek: false, status: 'Active', howToUse: ['Upload your PDF document.', 'The tool will instantly analyze the file and display the total number of pages.'] },
    { name: 'PDF Page Numberer', description: 'Add customizable page numbers to your PDF documents, with options for position, format, and style.', icon: 'Hash', category: 'pdf', plan: 'Pro', isNew: true, isToolOfTheWeek: false, status: 'Active', howToUse: ['Upload your PDF file.', 'Choose the position for the page numbers (e.g., bottom center).', 'Select the format and starting number.', 'Click "Add Numbers & Download" to get your numbered PDF.'] },
    { name: 'PDF Page Remover', description: 'Delete one or more specific pages from a PDF document to create a new, refined file.', icon: 'FileMinus', category: 'pdf', plan: 'Pro', isNew: true, isToolOfTheWeek: false, status: 'Active', howToUse: ['Upload your PDF file.', 'Enter the page numbers you want to delete (e.g., "2, 5-7").', 'Click "Remove Pages & Download".', 'A new PDF without the specified pages will be downloaded.'] },
    { name: 'PDF Organizer', description: 'Visually rearrange, delete, rotate, and organize pages from multiple PDF files into one new document.', icon: 'Layers', category: 'pdf', plan: 'Pro', isNew: true, isToolOfTheWeek: false, status: 'Active', howToUse: ['Upload one or more PDF files.', 'Drag, rotate, or delete page thumbnails from all documents.', 'Arrange them in the desired final order.', 'Click "Create PDF" to merge and download your new document.'] },
    { name: 'Website Screenshot', description: 'Take a full-page, high-resolution screenshot of any website by simply entering its URL.', icon: 'MonitorSmartphone', category: 'dev', plan: 'Free', isNew: true, isToolOfTheWeek: false, status: 'Active', howToUse: ['Enter the full URL of the website you want to capture.', 'Choose your desired options (e.g., full page, specific device view).', 'Click "Take Screenshot".', 'Download the resulting image file.'] },
    { name: 'What Is My Browser', description: 'Get detailed information about your web browser, operating system, screen size, and more.', icon: 'Globe', category: 'dev', plan: 'Free', isNew: true, isToolOfTheWeek: false, status: 'Active', howToUse: ['Simply load the page.', 'The tool will automatically detect and display details about your browser, OS, IP address, and screen resolution.'] },
    { name: 'Negative Marking Calculator', description: 'Calculate your final score in exams that use a negative marking scheme for incorrect answers.', icon: 'Calculator', category: 'calculator', plan: 'Free', isNew: true, isToolOfTheWeek: false, status: 'Active', howToUse: ['Enter the total number of questions and marks per correct answer.', 'Input the number of correct and incorrect answers.', 'Specify the negative marks for each wrong answer.', 'The calculator will show your final score.'] },
    { name: 'YouTube Channel Banner Downloader', description: 'Download the high-quality banner image (channel art) from any YouTube channel.', icon: 'Download', category: 'video', plan: 'Free', isNew: true, isToolOfTheWeek: false, status: 'Active', howToUse: ['Paste the URL of a YouTube channel.', 'Click the "Download Banner" button.', 'The highest resolution channel art will be available for download.'] },
    { name: 'YouTube Channel Logo Downloader', description: 'Download the high-resolution profile picture or logo from any YouTube channel.', icon: 'Download', category: 'video', plan: 'Free', isNew: true, isToolOfTheWeek: false, status: 'Active', howToUse: ['Paste the URL of a YouTube channel.', 'Click the "Download Logo" button.', 'The channel\'s profile picture will be available for download in high quality.'] },
    { name: 'YouTube Video Description Extractor', description: 'Extract and view the full, formatted text description of any YouTube video.', icon: 'FileText', category: 'video', plan: 'Free', isNew: true, isToolOfTheWeek: false, status: 'Active', howToUse: ['Paste the URL of a YouTube video.', 'Click "Extract Description".', 'The full video description will be displayed for you to copy.'] },
    { name: 'YouTube Video Title Extractor', description: 'Quickly extract the complete title from any YouTube video by pasting its URL.', icon: 'FileText', category: 'video', plan: 'Free', isNew: true, isToolOfTheWeek: false, status: 'Active', howToUse: ['Paste the URL of a YouTube video.', 'Click "Extract Title".', 'The video\'s full title will be displayed.'] },
    { name: 'YouTube Video Thumbnail Downloader', description: 'Download thumbnails from any YouTube video in all available resolutions (HD, SD, etc.).', icon: 'Image', category: 'video', plan: 'Free', isNew: true, isToolOfTheWeek: false, status: 'Active', howToUse: ['Paste the URL of a YouTube video.', 'The tool will display all available thumbnail resolutions (HD, SD, default).', 'Click on the desired resolution to download the thumbnail image.'] },
    { name: 'YouTube Region Restriction Checker', description: 'Check if a YouTube video is blocked or restricted in any country around the world.', icon: 'Globe', category: 'video', plan: 'Free', isNew: true, isToolOfTheWeek: false, status: 'Active', howToUse: ['Paste the URL of the YouTube video you want to check.', 'Click the "Check Restrictions" button.', 'The tool will display a list of countries where the video is blocked.'] },
    { name: 'Google Drive Direct Link Generator', description: 'Convert your Google Drive sharing links into permanent, direct download links for easy sharing.', icon: 'Link', category: 'dev', plan: 'Free', isNew: true, isToolOfTheWeek: false, status: 'Active', howToUse: ['Paste your shareable Google Drive link into the input field.', 'Click the "Generate Direct Link" button.', 'Copy the new link, which will force a download when clicked.'] },
    { name: 'Dropbox Direct Link Generator', description: 'Convert your Dropbox sharing links into permanent, direct download links that start downloading immediately.', icon: 'Link', category: 'dev', plan: 'Free', isNew: true, isToolOfTheWeek: false, status: 'Active', howToUse: ['Paste your Dropbox sharing link.', 'The tool will automatically modify it to a direct download link.', 'Copy the new link to share.'] },
    { name: 'OneDrive Direct Link Generator', description: 'Convert your OneDrive sharing links into permanent, direct download links for seamless file sharing.', icon: 'Link', category: 'dev', plan: 'Free', isNew: true, isToolOfTheWeek: false, status: 'Active', howToUse: ['Paste your OneDrive sharing link.', 'Click "Generate Direct Link".', 'The tool will provide a new link that initiates a direct download.'] },
    { name: 'NSDL PAN Card Photo and Signature Resizer', description: 'Resize your photo and signature to the exact dimensions and file size required for NSDL PAN card applications.', icon: 'Crop', category: 'miscellaneous', plan: 'Free', isNew: true, isToolOfTheWeek: false, status: 'Active', howToUse: ['Upload your photo and signature images separately.', 'The tool will automatically resize them to the NSDL-specified dimensions and file size.', 'Download the perfectly formatted images.'] },
    { name: 'UTI PAN Card Photo and Signature Resizer', description: 'Resize your photo and signature to meet the specific requirements for UTI PAN card applications online.', icon: 'Crop', category: 'miscellaneous', plan: 'Free', isNew: true, isToolOfTheWeek: false, status: 'Active', howToUse: ['Upload your photo and signature images.', 'The tool will automatically crop and resize them according to UTI guidelines.', 'Download the ready-to-upload images.'] },
    { name: 'PRN to PDF', description: 'Convert PRN files, commonly generated by the "Print to File" option, into standard PDF documents.', icon: 'FileText', category: 'pdf', plan: 'Free', isNew: true, isToolOfTheWeek: false, status: 'Active', howToUse: ['Upload your .prn file.', 'Click the "Convert to PDF" button.', 'Download the resulting PDF document.'] },
    { name: 'PPT to PDF', description: 'Convert your PowerPoint presentations (.ppt, .pptx) into universally accessible PDF files in seconds.', icon: 'FileText', category: 'pdf', plan: 'Pro', isNew: true, isToolOfTheWeek: false, status: 'Active', howToUse: ['Upload your PowerPoint file (.ppt or .pptx).', 'Click the "Convert to PDF" button.', 'Download the generated PDF file.'] },
    { name: 'Text Encryption & Decryption', description: 'Encrypt and decrypt text using various algorithms like AES and TripleDES for secure communication.', icon: 'Lock', category: 'dev', plan: 'Pro', isNew: true, isToolOfTheWeek: false, status: 'Active', howToUse: ['Paste the text you want to encrypt or decrypt.', 'Select the encryption algorithm (e.g., AES-256).', 'Enter a secret key or password.', 'Click "Encrypt" or "Decrypt" to get the result.'] },
    { name: 'Password Strength Checker', description: 'Check the strength and security of your password against common patterns and vulnerabilities.', icon: 'CheckCheck', category: 'dev', plan: 'Free', isNew: true, isToolOfTheWeek: false, status: 'Active', howToUse: ['Type your password into the input field.', 'The tool will instantly analyze its strength and provide feedback.', 'It will check for length, character types, and common patterns.'] },
    { name: 'SHA256 Hash Generator', description: 'Generate a secure SHA-256 hash for any text string, commonly used for data integrity checks.', icon: 'Hash', category: 'dev', plan: 'Free', isNew: true, isToolOfTheWeek: false, status: 'Active', howToUse: ['Enter any text or string into the input box.', 'The tool will automatically generate the corresponding SHA-256 hash.', 'Copy the generated hash.'] },
    { name: 'Universal Hash Generator', description: 'Generate various types of cryptographic hashes for your text, including MD5, SHA1, SHA512, and more.', icon: 'Hash', category: 'dev', plan: 'Free', isNew: true, isToolOfTheWeek: false, status: 'Active', howToUse: ['Enter the text you want to hash.', 'Select the desired hashing algorithm (MD5, SHA1, etc.).', 'The generated hash will be displayed for you to copy.'] },
    { name: 'AES Encryption & Decryption', description: 'Encrypt and decrypt your files using the Advanced Encryption Standard (AES) for maximum security.', icon: 'Key', category: 'dev', plan: 'Pro', isNew: true, isToolOfTheWeek: false, status: 'Active', howToUse: ['Upload the file you want to process.', 'Choose whether to encrypt or decrypt.', 'Enter your secret password.', 'Download the processed file.'] },
    { name: 'Universal File Converter', description: 'Convert your files from one format to another across a wide range of categories like documents, images, and more.', icon: 'FileCog', category: 'dev', plan: 'Pro', isNew: true, isToolOfTheWeek: false, status: 'Active', howToUse: ['Upload your source file.', 'Select the target output format from the extensive list.', 'Click the "Convert" button.', 'Download your newly converted file.'] },
    { name: 'Image Shape Converter', description: 'Convert your images into various creative shapes like circles, stars, hearts, and more.', icon: 'Shapes', category: 'image', plan: 'Free', isNew: true, isToolOfTheWeek: false, status: 'Active', howToUse: ['Upload your image.', 'Select the desired shape (e.g., Circle, Heart, Star).', 'The tool will crop your image into that shape with a transparent background.', 'Download the resulting PNG image.'] },
    { name: 'Morse to Text Translator', description: 'Translate Morse code signals (dots and dashes) into plain, readable text.', icon: 'MessageSquare', category: 'miscellaneous', plan: 'Free', isNew: true, isToolOfTheWeek: false, status: 'Active', howToUse: ['Enter your Morse code into the input box, using dots (.) and dashes (-).', 'The translated text will appear in the output box automatically.'] },
    { name: 'Text to Morse Code', description: 'Translate plain text into universally recognized Morse code signals.', icon: 'MessageSquare', category: 'miscellaneous', plan: 'Free', isNew: true, isToolOfTheWeek: false, status: 'Active', howToUse: ['Enter your text in the input box.', 'The corresponding Morse code will be generated in the output box automatically.'] },
    { name: 'Cryptocurrency Converter', description: 'Convert between different cryptocurrencies and traditional fiat currencies with real-time rates.', icon: 'Bitcoin', category: 'calculator', plan: 'Free', isNew: true, isToolOfTheWeek: false, status: 'Active', howToUse: ['Enter the amount you want to convert.', 'Select the source currency (e.g., BTC) and the target currency (e.g., USD).', 'The tool will display the converted amount based on the latest exchange rates.'] },
    { name: 'Barcode Generator', description: 'Generate various types of barcodes, such as UPC, EAN, and Code 128, for your products or inventory.', icon: 'Barcode', category: 'dev', plan: 'Free', isNew: true, isToolOfTheWeek: false, status: 'Active', howToUse: ['Select the barcode type (e.g., Code 128, EAN-13).', 'Enter the data you want to encode.', 'Click "Generate Barcode".', 'Download the barcode as an image file.'] },
    { name: 'Currency Converter', description: 'Convert between different world currencies with up-to-date exchange rates for your travel or business needs.', icon: 'Coins', category: 'calculator', plan: 'Free', isNew: true, isToolOfTheWeek: false, status: 'Active', howToUse: ['Enter the amount you wish to convert.', 'Select the "From" and "To" currencies from the dropdown lists.', 'The converted amount will be displayed based on real-time exchange rates.'] },
    { name: 'Credit Card Interest Calculator', description: 'Calculate the interest on your credit card balance to better understand and manage your debt.', icon: 'CreditCard', category: 'calculator', plan: 'Free', isNew: true, isToolOfTheWeek: false, status: 'Active', howToUse: ['Enter your credit card balance.', 'Input the Annual Percentage Rate (APR).', 'Specify your monthly payment.', 'The tool will show you how long it takes to pay off and the total interest paid.'] },
    { name: 'UUID Generator', description: 'Generate universally unique identifiers (UUIDs) in various versions for your application needs.', icon: 'Hash', category: 'dev', plan: 'Free', isNew: true, isToolOfTheWeek: false, status: 'Active', howToUse: ['Select the number of UUIDs you want to generate.', 'Click the "Generate UUIDs" button.', 'The new UUIDs will be displayed in the text box for you to copy.'] },
    { name: 'Image Metadata Viewer', description: 'View detailed EXIF and other metadata from your images, such as camera settings, location, and date.', icon: 'Camera', category: 'image', plan: 'Free', isNew: true, isToolOfTheWeek: false, status: 'Active', howToUse: ['Upload an image file (JPG, PNG, etc.).', 'The tool will extract and display all available metadata.', 'View details like camera model, aperture, ISO, and GPS data if available.'] },
    { name: 'AI Image Quality Enhancer', description: 'Upscale and enhance the quality, resolution, and details of your images using powerful AI algorithms.', icon: 'Sparkles', category: 'ai', plan: 'Pro', isNew: true, isToolOfTheWeek: false, status: 'Active', howToUse: ['Upload a low-resolution or blurry image.', 'Select the enhancement factor (e.g., 2x, 4x).', 'Click "Enhance Image".', 'The AI will upscale and sharpen your image, which you can then download.'] },
    { name: 'AI Web Content Summarizer', description: 'Summarize and explain the content of any public website or article by simply providing a URL.', icon: 'Globe', category: 'ai', plan: 'Pro', isNew: true, isToolOfTheWeek: false, status: 'Active', howToUse: ['Paste the URL of the webpage or article you want to process.', 'Click the "Process URL" button.', 'The AI will provide both a concise summary and a detailed explanation of the content.'] },
    { name: 'Flip Image', description: 'Flip an image horizontally or vertically to create a mirrored version of your original picture.', icon: 'FlipHorizontal', category: 'image', plan: 'Free', isNew: true, isToolOfTheWeek: false, status: 'Active', howToUse: ['Upload the image you want to flip.', 'Click "Flip Horizontal" or "Flip Vertical".', 'Download the modified image.'] },
    { name: 'ICO Converter', description: 'Convert your images (PNG, JPG) to the ICO format, perfect for creating website favicons.', icon: 'FileHeart', category: 'image', plan: 'Free', isNew: true, isToolOfTheWeek: false, status: 'Active', howToUse: ['Upload your source image (preferably square).', 'Click the "Convert & Download .ICO" button.', 'Your new .ico file will be automatically downloaded.'] },
    { name: 'PDF to Word', description: 'Convert your PDF files back into editable Microsoft Word documents to easily make changes.', icon: 'FileText', category: 'pdf', plan: 'Pro', isNew: true, isToolOfTheWeek: false, status: 'Active', howToUse: ['Upload your PDF file.', 'Click "Convert to Word".', 'Download the editable .docx file.'] },
    { name: 'PDF to JPG', description: 'Convert each page of a PDF document into high-quality JPG images.', icon: 'FileImage', category: 'pdf', plan: 'Pro', isNew: true, isToolOfTheWeek: false, status: 'Active', howToUse: ['Upload your PDF file.', 'The tool will convert each page into a separate JPG image.', 'Download the images as a ZIP file.'] },
    { name: 'Meta Tag Generator', description: 'Create essential meta tags (title, description, keywords) to improve your website\'s search engine optimization (SEO).', icon: 'Tags', category: 'seo', plan: 'Free', isNew: true, isToolOfTheWeek: false, status: 'Active', howToUse: ['Enter your site title and meta description.', 'The tool will generate the necessary HTML meta tags.', 'Copy the generated code and paste it into the &lt;head&gt; section of your website.'] },
    { name: 'Robots.txt Generator', description: 'Generate a robots.txt file to guide search engine crawlers on which parts of your site to index or ignore.', icon: 'Bot', category: 'seo', plan: 'Free', isNew: true, isToolOfTheWeek: false, status: 'Active', howToUse: ['Use the options to allow or disallow different user-agents (bots).', 'Add sitemap URLs if you have them.', 'The tool will generate the robots.txt content for you to copy.'] },
    { name: 'XML Sitemap Generator', description: 'Create an XML sitemap for your website to help search engines like Google better discover and index all your pages.', icon: 'FileCode', category: 'seo', plan: 'Free', isNew: true, isToolOfTheWeek: false, status: 'Active', howToUse: ['Enter your website\'s URL.', 'The tool will crawl your site to find all the pages.', 'Click "Generate Sitemap" to create the sitemap.xml file.', 'Download the file and upload it to your website\'s root directory.'] },
    { name: 'Favicon Checker', description: 'Check if a website has a favicon installed and preview how it looks in a browser tab.', icon: 'Image', category: 'seo', plan: 'Free', isNew: true, isToolOfTheWeek: false, status: 'Active', howToUse: ['Enter the URL of the website you want to check.', 'Click "Check Favicon".', 'The tool will display the website\'s favicon if it exists.'] },
    { name: 'Keyword Density Checker', description: 'Analyze the keyword density of your text content to optimize for SEO and avoid keyword stuffing.', icon: 'Key', category: 'seo', plan: 'Free', isNew: true, isToolOfTheWeek: false, status: 'Active', howToUse: ['Paste your article or text into the text area.', 'Click "Analyze Text".', 'The tool will show you a table of the most frequent keywords and their density percentage.'] },
    { name: 'SERP Checker', description: 'Check the real-time search engine results page (SERP) for a given keyword in a specific location.', icon: 'Search', category: 'seo', plan: 'Free', isNew: true, status: 'Active', howToUse: ['Enter the keyword you want to check.', 'Select the country for the search results.', 'Optionally, enter your domain to highlight its position.', 'Click "Check Rankings" to see the top search results.'] },
    { name: 'Redirect Checker', description: 'Check the full redirect chain and status code (301, 302, etc.) of any URL to diagnose SEO issues.', icon: 'Link', category: 'seo', plan: 'Free', isNew: true, status: 'Active', howToUse: ['Enter a URL into the input field.', 'Click "Check Redirects".', 'The tool will show you the full path the URL takes, including all status codes.'] },
    { name: 'Schema Generator', description: 'Generate structured data markup (JSON-LD) for your website to improve how search engines understand your content.', icon: 'Code', category: 'seo', plan: 'Free', isNew: true, status: 'Active', howToUse: ['Select the type of schema you want to create (e.g., FAQ, Article).', 'Fill in the required fields for that schema type.', 'The tool will generate the JSON-LD script.', 'Copy the script and paste it into your website\'s HTML.'] },
    { name: 'Title Tag Checker', description: 'Check the length (in characters and pixels) of your title tags to ensure they don\'t get truncated in search results.', icon: 'Text', category: 'seo', plan: 'Free', isNew: true, status: 'Active', howToUse: ['Enter your proposed title tag into the input field.', 'The tool will show you the character count and an estimated pixel width.', 'A preview shows how your title might look in Google search results.'] },
    { name: 'Website Word Counter', description: 'Count the total number of words on any webpage by simply entering its URL.', icon: 'FileSearch', category: 'seo', plan: 'Free', isNew: true, isToolOfTheWeek: false, status: 'Active', howToUse: ['Enter the URL of the webpage you want to analyze.', 'Click "Count Words".', 'The tool will fetch the page content and display the total word count.'] },
    { name: 'Fuel Cost Calculator', description: 'Calculate the total fuel cost for a trip based on distance, fuel efficiency, and price per liter.', icon: 'Fuel', category: 'calculator', plan: 'Free', isNew: true, isToolOfTheWeek: false, status: 'Active', howToUse: ['Enter the total distance of your trip in kilometers.', 'Provide your car\'s fuel efficiency (km/l).', 'Enter the current price of fuel per liter.', 'Click "Calculate Fuel Cost" to see your total estimated cost.'] },
    { name: 'GPA Calculator', description: 'Calculate your Grade Point Average (GPA) based on your course credits and grades.', icon: 'Calculator', category: 'calculator', plan: 'Free', isNew: true, isToolOfTheWeek: false, status: 'Active', howToUse: ['Add a row for each of your courses.', 'Enter the credits and the grade you received for each course.', 'Click "Calculate GPA".', 'The tool will display your calculated GPA.'] },
    { name: 'Loan Calculator', description: 'Calculate your monthly loan payments, total payment, and total interest for mortgages, car loans, or personal loans.', icon: 'Landmark', category: 'calculator', plan: 'Free', isNew: true, isToolOfTheWeek: false, status: 'Active', howToUse: ['Enter the total loan amount.', 'Input the annual interest rate.', 'Specify the loan term in years or months.', 'Click "Calculate" to see your monthly payment and total interest.'] },
    { name: 'Percentage Calculator', description: 'Easily calculate percentages, find what a percentage of a number is, or determine percentage change.', icon: 'Percent', category: 'calculator', plan: 'Free', isNew: true, isToolOfTheWeek: false, status: 'Active', howToUse: ['Select the type of calculation you want to perform.', 'Enter the required values in the input fields.', 'Click "Calculate" to see the result.'] },
    { name: 'Time Zone Converter', description: 'Convert times between different time zones around the world to coordinate meetings and events.', icon: 'Clock', category: 'calculator', plan: 'Free', isNew: true, isToolOfTheWeek: false, status: 'Active', howToUse: ['The tool displays the current time in several default time zones.', 'You can add more time zones from the dropdown list.', 'The times will update in real-time.'] },
    { name: 'Unix Timestamp Converter', description: 'Convert Unix timestamps to human-readable dates and vice-versa for development and data analysis.', icon: 'Timer', category: 'dev', plan: 'Free', isNew: true, isToolOfTheWeek: false, status: 'Active', howToUse: ['Enter a Unix timestamp to see the human-readable date.', 'Alternatively, use the date picker to select a date and see its Unix timestamp.'] },
    { name: 'HTML Minifier', description: 'Minify your HTML code to reduce file size, remove whitespace, and improve website loading performance.', icon: 'FileCode', category: 'dev', plan: 'Free', isNew: true, isToolOfTheWeek: false, status: 'Active', howToUse: ['Paste your HTML code into the "Original HTML" box.', 'Click the "Minify HTML" button.', 'The minified code will appear in the "Minified HTML" box.', 'Click "Copy" to use the minified code.'] },
    { name: 'JavaScript Minifier', description: 'Minify your JavaScript code to decrease file size and speed up your website or application.', icon: 'FileCode', category: 'dev', plan: 'Free', isNew: true, isToolOfTheWeek: false, status: 'Active', howToUse: ['Paste your JavaScript code into the "Original JavaScript" box.', 'Click the "Minify JS" button.', 'The minified code will appear in the "Minified JavaScript" box.', 'Click "Copy" to use the minified code.'] },
    { name: 'SQL Formatter', description: 'Format and beautify your SQL queries to make them more readable and easier to debug.', icon: 'Database', category: 'dev', plan: 'Free', isNew: true, isToolOfTheWeek: false, status: 'Active', howToUse: ['Paste your unformatted SQL query into the text area.', 'Choose your desired formatting options (e.g., indentation).', 'Click "Format SQL".', 'Copy the clean, formatted SQL query.'] },
    { name: 'YouTube Video Downloader', description: 'Download YouTube videos in various qualities and formats, including MP4 and MP3.', icon: 'Youtube', category: 'video', plan: 'Pro', isNew: true, isToolOfTheWeek: false, status: 'Active', howToUse: ['Paste the URL of the YouTube video.', 'The tool will fetch available download links for different qualities.', 'Click on your desired quality to start the download.'] },
    { name: 'X (Twitter) Video Downloader', description: 'Download videos from posts on X (formerly Twitter) by simply pasting the post URL.', icon: 'Twitter', category: 'video', plan: 'Pro', isNew: true, isToolOfTheWeek: false, status: 'Active', howToUse: ['Copy the URL of the tweet containing the video.', 'Paste the URL into the input field.', 'Click "Download Video" to save the video file.'] },
    { name: 'Instagram Video Downloader', description: 'Download videos and reels from public Instagram posts directly to your device.', icon: 'Instagram', category: 'video', plan: 'Pro', isNew: true, isToolOfTheWeek: false, status: 'Active', howToUse: ['Copy the URL of the Instagram post, Reel, or Story.', 'Paste the URL into the input field.', 'Click "Download Video" to get the video file.'] },
    { name: 'Threads Video Downloader', description: 'Download videos from Threads posts by providing the URL of the post.', icon: 'AtSign', category: 'video', plan: 'Pro', isNew: true, isToolOfTheWeek: false, status: 'Active', howToUse: ['Copy the URL of the Threads post with the video.', 'Paste the URL into the tool.', 'Click "Download Video" to save the video.'] },
    { name: 'LinkedIn Video Downloader', description: 'Download videos from public LinkedIn posts to save for offline viewing or sharing.', icon: 'Linkedin', category: 'video', plan: 'Pro', isNew: true, isToolOfTheWeek: false, status: 'Active', howToUse: ['Copy the URL of the LinkedIn post containing the video.', 'Paste the URL into the input field.', 'Click the "Download Video" button.'] },
    { name: 'Pinterest Video Downloader', description: 'Download videos from Pinterest pins to save your favorite ideas and tutorials.', icon: 'BookImage', category: 'video', plan: 'Pro', isNew: true, isToolOfTheWeek: false, status: 'Active', howToUse: ['Copy the URL of the Pinterest pin that has the video.', 'Paste the URL into the download tool.', 'Click "Download Video" to save it.'] },
    { name: 'AI SEO Keyword Generator', description: 'Get a comprehensive list of primary, secondary, and long-tail keywords for any topic to boost your search engine ranking.', icon: 'Key', category: 'seo', plan: 'Pro', isNew: true, isToolOfTheWeek: false, status: 'Active', howToUse: ['Enter your main topic or keyword.', 'Optionally, specify your target audience.', 'Click "Generate Keywords".', 'The AI will provide lists of primary, secondary, and long-tail keywords.'] },
    { name: 'Case Converter', description: 'Easily convert text between different letter cases like uppercase, lowercase, title case, and more with a single click.', icon: 'CaseSensitive', category: 'text', plan: 'Free', isNew: false, isToolOfTheWeek: false, status: 'Active', howToUse: ['Paste your text into the input field.', 'Click on the desired case conversion button (e.g., UPPERCASE).', 'The text will be instantly converted in the same box.'] },
];

const generateSlug = (name: string) => {
    return name.toLowerCase().replace(/ & /g, ' and ').replace(/\s+/g, '-').replace(/[^\w-]+/g, '');
};

/**
 * Fetches all tools from Firestore and synchronizes them with the `initialTools` list.
 * This function ensures the database reflects the "source of truth" defined in the code.
 * - Tools in the database that are NOT in `initialTools` will be DELETED.
 * - Tools in `initialTools` that are NOT in the database will be CREATED.
 * - Tools in both will be UPDATED to ensure their data is current.
 */
export async function getTools(): Promise<Tool[]> {
    const adminDb = getAdminDb();
    if (!adminDb) {
        console.error("Firebase Admin is not initialized. Cannot fetch tools.");
        // Return a stable, empty version of tools from code.
        return initialTools.map(toolData => {
            const slug = generateSlug(toolData.name);
            return ToolSchema.parse({
                id: slug,
                slug: slug,
                createdAt: new Date().toISOString(),
                ...toolData,
            });
        }).sort((a, b) => a.name.localeCompare(b.name));
    }

    const toolsRef = adminDb.collection(TOOLS_COLLECTION);
    
    try {
        const snapshot = await toolsRef.get();
        const dbTools: Map<string, Tool> = new Map();
        snapshot.docs.forEach(doc => {
            const data = doc.data();
            const tool = ToolSchema.safeParse({ id: doc.id, ...data, createdAt: (data.createdAt as Timestamp)?.toDate().toISOString() || new Date().toISOString() });
            if (tool.success) {
                // Use the doc.id which is the slug as the key
                dbTools.set(doc.id, tool.data);
            } else {
                console.warn(`Invalid tool data in Firestore with ID ${doc.id}:`, tool.error);
            }
        });

        const codeTools: Map<string, Tool> = new Map();
        initialTools.forEach(toolData => {
            const slug = generateSlug(toolData.name);
            const tool = ToolSchema.parse({
                id: slug, // The ID and slug are the same
                slug: slug,
                createdAt: new Date().toISOString(), // This is temporary, will be replaced by server timestamp
                ...toolData,
            });
            codeTools.set(slug, tool);
        });

        const batch = adminDb.batch();
        let hasChanges = false;

        // Find tools to delete from DB (in DB but not in code)
        for (const dbSlug of dbTools.keys()) {
            if (!codeTools.has(dbSlug)) {
                console.log(`[SYNC] Deleting tool from DB: ${dbSlug}`);
                batch.delete(toolsRef.doc(dbSlug));
                hasChanges = true;
            }
        }

        // Find tools to add or update
        for (const [codeSlug, codeTool] of codeTools.entries()) {
            const dbTool = dbTools.get(codeSlug);
            
            // Destructure to remove fields that shouldn't be directly compared or are auto-generated
            const { id: codeId, slug: codeSlugIgnored, createdAt: codeCreatedAt, ...codeToolData } = codeTool;
            
            if (!dbTool) {
                console.log(`[SYNC] Adding new tool to DB: ${codeSlug}`);
                const docRef = toolsRef.doc(codeSlug);
                batch.set(docRef, { ...codeToolData, slug: codeSlug, createdAt: FieldValue.serverTimestamp() });
                hasChanges = true;
            } else {
                const { id: dbId, slug: dbSlug, createdAt: dbCreatedAt, ...dbToolData } = dbTool;
                
                // Create comparable objects by removing the slug from the code tool data as well.
                const comparableCodeToolData = { ...codeToolData };
                
                // Compare the rest of the data.
                if (JSON.stringify(comparableCodeToolData) !== JSON.stringify(dbToolData)) {
                    console.log(`[SYNC] Updating tool in DB: ${codeSlug}`);
                    const docRef = toolsRef.doc(codeSlug);
                    batch.update(docRef, comparableCodeToolData);
                    hasChanges = true;
                }
            }
        }
        
        if (hasChanges) {
            await batch.commit();
            console.log("[SYNC] Database synchronized successfully.");
        } else {
            console.log("[SYNC] No database changes needed.");
        }
        
        // Return the source of truth from the code, sorted alphabetically
        return Array.from(codeTools.values()).sort((a, b) => a.name.localeCompare(b.name));

    } catch (error) {
        console.error("Error synchronizing tools:", error);
        return []; // Return empty on error to prevent crashes
    }
}


/**
 * Adds or updates a tool in Firestore.
 * @param {Partial<Tool>} toolData - The data for the tool. If an ID is provided, it updates; otherwise, it adds.
 * @returns {Promise<{ success: boolean; message: string; toolId?: string }>}
 */
export async function upsertTool(toolData: Partial<Tool>): Promise<{ success: boolean; message: string; toolId?: string }> {
  try {
    const adminDb = getAdminDb();
    const { id, ...data } = toolData;
    
    if (data.name) {
      data.slug = generateSlug(data.name);
    }
    
    // Validate data before saving
    const validatedData = UpsertToolInputSchema.parse(data);

    if (id) {
      const toolRef = adminDb.collection(TOOLS_COLLECTION).doc(id);
      await toolRef.update(validatedData);
      return { success: true, message: 'Tool updated successfully.', toolId: id };
    } else {
      if (!data.slug) throw new Error("Slug is required for a new tool.");
      const docRef = adminDb.collection(TOOLS_COLLECTION).doc(data.slug);
      await docRef.set({ ...validatedData, createdAt: FieldValue.serverTimestamp() });
      return { success: true, message: 'Tool added successfully.', toolId: docRef.id };
    }
  } catch (error: any) {
    console.error("Error upserting tool:", error);
    return { success: false, message: error.message || 'An unknown error occurred.' };
  }
}


/**
 * Deletes a tool from Firestore.
 * @param {string} toolId - The ID of the tool to delete.
 * @returns {Promise<{ success: boolean; message: string }>}
 */
export async function deleteTool(toolId: string): Promise<{ success: boolean; message: string }> {
    const adminDb = getAdminDb();
    if (!toolId) {
        return { success: false, message: 'Tool ID is required.' };
    }
    try {
        const toolRef = adminDb.collection(TOOLS_COLLECTION).doc(toolId);
        const doc = await toolRef.get();
        if (!doc.exists) {
            return { success: false, message: 'Tool not found.' };
        }
        
        await toolRef.delete();

        // Log the component file path for manual deletion
        const toolName = doc.data()?.name || toolId;
        const componentName = toolName.replace(/\s+/g, '');
        const componentPath = `src/components/tools/${componentName}.tsx`;
        console.log(`ACTION REQUIRED: Tool '${toolName}' deleted from database. Please manually delete the component file: ${componentPath}`);

        return { success: true, message: 'Tool deleted successfully.' };
    } catch (error: any) {
        console.error(`Error deleting tool ${toolId}:`, error);
        return { success: false, message: error.message || 'An unknown error occurred.' };
    }
}

/**
 * Fetches the favorite tools for a specific user.
 * @param {string} userId - The ID of the user.
 * @returns {Promise<Tool[]>} A list of the user's favorite tools.
 */
export async function getFavoriteTools(userId: string): Promise<Tool[]> {
  try {
    const adminDb = getAdminDb();
    const userDocRef = adminDb.collection('users').doc(userId);
    const userDocSnap = await userDocRef.get();

    if (!userDocSnap.exists()) {
      return [];
    }

    const userData = userDocSnap.data();
    const favoriteSlugs: string[] = userData?.favorites || [];

    if (favoriteSlugs.length === 0) {
      return [];
    }

    const allTools = await getTools();
    const userFavorites = allTools.filter(tool => favoriteSlugs.includes(tool.slug));
    
    return userFavorites;
  } catch (error) {
    console.error(`Error fetching favorite tools for user ${userId}:`, error);
    return [];
  }
}

const RequestToolInputSchema = ToolRequestSchema.pick({
    name: true,
    email: true,
    toolName: true,
    description: true,
});
type RequestToolInput = {
    name: string;
    email: string;
    toolName: string;
    description: string;
};

export async function requestNewTool(input: RequestToolInput): Promise<{ success: boolean; message: string }> {
    try {
        const adminDb = getAdminDb();
        const validatedInput = RequestToolInputSchema.parse(input);
        await adminDb.collection(TOOL_REQUESTS_COLLECTION).add({
            ...validatedInput,
            status: 'pending',
            requestedAt: FieldValue.serverTimestamp(),
        });
        return { success: true, message: "Your tool request has been submitted successfully!" };
    } catch (error: any) {
        console.error("Error submitting tool request:", error);
        return { success: false, message: error.message || 'An unknown error occurred.' };
    }
}

/**
 * Fetches all tool requests from Firestore.
 */
export async function getToolRequests(): Promise<ToolRequest[]> {
    try {
        const adminDb = getAdminDb();
        const snapshot = await adminDb.collection(TOOL_REQUESTS_COLLECTION).orderBy('requestedAt', 'desc').get();
        return snapshot.docs.map(doc => {
            const data = doc.data();
            return {
                id: doc.id,
                ...data,
                requestedAt: (data.requestedAt as Timestamp)?.toDate().toISOString() || new Date().toISOString(),
            } as ToolRequest;
        });
    } catch (error) {
        console.error("Error fetching tool requests:", error);
        return [];
    }
}

/**
 * Updates the status of a tool request.
 */
export async function updateToolRequestStatus(requestId: string, status: 'approved' | 'rejected'): Promise<{ success: boolean, message: string }> {
    try {
        const adminDb = getAdminDb();
        const requestRef = adminDb.collection(TOOL_REQUESTS_COLLECTION).doc(requestId);
        await requestRef.update({ status });
        return { success: true, message: 'Request status updated.' };
    } catch (error: any) {
        return { success: false, message: error.message || 'An unknown error occurred.' };
    }
}


const GenerateToolDescriptionInputSchema = z.object({
  toolName: z.string().describe('The name of the tool to generate a description for.'),
});

const GenerateToolDescriptionOutputSchema = z.object({
  description: z.string().describe('A detailed, user-friendly description of what the tool does.'),
});

export async function generateToolDescription(input: z.infer<typeof GenerateToolDescriptionInputSchema>): Promise<z.infer<typeof GenerateToolDescriptionOutputSchema>> {
  const prompt = `Generate a concise and user-friendly description for a web tool called "${input.toolName}". The description should be a single sentence, starting with a verb, and clearly explain the tool's primary function. For example, for a "Case Converter" tool, a good description would be "Convert text between different letter cases (e.g., uppercase, lowercase, title case)."`;

  // This would be a call to a Genkit flow in a real app
  // For now, we simulate a simple response.
  const generatedDesc = `A new, amazing tool that helps you with ${input.toolName}.`;

  return { description: generatedDesc };
}

// src/ai/flows/user-management.ts (for toggleFavoriteTool)
export async function toggleFavoriteTool(userId: string, toolSlug: string): Promise<{ success: boolean, message: string }> {
  const adminDb = getAdminDb();
  if (!userId || !toolSlug) {
    return { success: false, message: "User ID and tool slug are required." };
  }
  try {
    const userRef = adminDb.collection('users').doc(userId);
    const userDoc = await userRef.get();

    if (!userDoc.exists) {
      return { success: false, message: "User not found." };
    }

    const userData = userDoc.data();
    const currentFavorites: string[] = userData?.favorites || [];

    if (currentFavorites.includes(toolSlug)) {
      // The field exists, so we can use update.
      await userRef.update({ favorites: FieldValue.arrayRemove(toolSlug) });
      return { success: true, message: "Removed from favorites." };
    } else {
      // If the field might not exist, using set with merge is safer.
      await userRef.set({ favorites: FieldValue.arrayUnion(toolSlug) }, { merge: true });
      return { success: true, message: "Added to favorites." };
    }
  } catch (error: any) {
    console.error("Error toggling favorite tool:", error);
    return { success: false, message: "Could not update favorites." };
  }
}
    
    

    



    

    

    





