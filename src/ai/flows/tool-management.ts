

'use server';

/**
 * @fileOverview Manages tools in Firestore.
 */
import { getAdminDb } from '@/lib/firebase-admin';
import { FieldValue, Timestamp, Query } from 'firebase-admin/firestore';
import { z } from 'zod';
import { type Tool, type UpsertToolInput, type ToolRequest, ToolSchema, UpsertToolInputSchema, ToolRequestSchema } from './tool-management.types';
import { unstable_cache as cache, revalidatePath } from 'next/cache';


const TOOLS_COLLECTION = 'tools';
const TOOL_REQUESTS_COLLECTION = 'toolRequests';

const initialTools: Omit<Tool, 'id' | 'slug' | 'createdAt'>[] = [
    { name: 'QR Code Generator', description: 'Generate custom QR codes from any text or URL. Download as PNG, JPG, or SVG for your personal or business needs.', icon: 'QrCode', category: 'dev', plan: 'Free', isNew: true, status: 'Active', howToUse: ['Enter the text or URL you want to encode.', 'Customize the QR code size and colors if needed.', 'Click "Download" and choose your desired format (PNG, JPG, or SVG).'] },
    { name: 'Barcode Generator', description: 'Create various types of barcodes like Code 128, EAN-13, and UPC. Customize dimensions and download your barcode for inventory, retail, and more.', icon: 'Barcode', category: 'dev', plan: 'Free', isNew: true, status: 'Active', howToUse: ['Select the barcode format you need.', 'Enter the data to be encoded in the barcode.', 'Adjust settings like width and height.', 'Download your generated barcode image.'] },
    { name: 'QR Code Scanner', description: '📷 Scan a QR code from an image file to reveal its content. Find out what URL, text, or data is hidden in any QR code.', icon: 'ScanLine', category: 'image', plan: 'Free', isNew: true, status: 'Active', howToUse: ['Upload an image file containing a QR code.', 'The tool will automatically scan the image.', 'The decoded text or URL from the QR code will be displayed below.'] },
    { name: 'Barcode Scanner', description: '📷 Scan a barcode from an image file to reveal its content. Supports various barcode formats like UPC, EAN, and Code 128.', icon: 'ScanLine', category: 'image', plan: 'Free', isNew: true, status: 'Active', howToUse: ['Upload an image file containing a barcode.', 'The tool will automatically scan the image.', 'The decoded data from the barcode will be displayed below.'] },
    { name: 'Word Counter', description: '📊 Instantly count words, characters, sentences, paragraphs, and estimate reading time. Perfect for writers, students, and professionals to ensure content meets specific length requirements.', icon: 'Calculator', category: 'text', plan: 'Free', isNew: false, status: 'Active', howToUse: ['Paste or type your text into the text area.', 'The tool will instantly display the word, character, sentence, and paragraph counts.', 'Review the metrics provided below the text area.'] },
    { name: 'Password Generator', description: '🔑 Create strong, secure, and highly customizable passwords with options for length, characters, and complexity to protect your online accounts.', icon: 'KeyRound', category: 'dev', plan: 'Free', isNew: false, status: 'Active', howToUse: ['Adjust the slider to set your desired password length.', 'Use the checkboxes to include or exclude uppercase, lowercase, numbers, and symbols.', 'Click the "Refresh" icon to generate a new password.', 'Click the "Copy" icon to copy the password to your clipboard.'] },
    { name: 'JSON Formatter', description: '✨ Format, validate, and beautify your JSON data. Makes complex data structures readable, helps in debugging, and provides a clear, tree-like view of your JSON.', icon: 'Braces', category: 'dev', plan: 'Free', isNew: false, status: 'Active', howToUse: ['Paste your raw JSON data into the text area.', 'Click the "Validate & Format" button.', 'The tool will automatically beautify the JSON and show a validation status.', 'Copy the formatted JSON to your clipboard.'] },
    { name: 'BMI Calculator', description: '❤️ Calculate your Body Mass Index (BMI) to quickly assess your weight status and overall health. Works with both Metric and Imperial units for your convenience.', icon: 'HeartPulse', category: 'calculator', plan: 'Free', isNew: false, status: 'Active', howToUse: ['Select your preferred unit system (Metric or Imperial).', 'Enter your height and weight in the respective fields.', 'Click the "Calculate BMI" button.', 'View your calculated BMI and corresponding health category.'] },
    { name: 'PDF Merger', description: '➕ Combine multiple PDF files into a single, organized document. Perfect for creating reports, presentations, or archiving related documents together.', icon: 'FilePlus2', category: 'pdf', plan: 'Pro', isNew: false, status: 'Active', howToUse: ['Upload two or more PDF files you want to merge.', 'Optionally, specify page ranges for each file (e.g., "1-3, 5").', 'Click the "Merge and Download" button.', 'Your combined PDF will be automatically downloaded.'] },
    { name: 'Unlock PDF', description: '🔓 Easily remove password protection and restrictions from your PDF files, allowing for editing, printing, and copying of content. (You must know the original password).', icon: 'Unlock', category: 'pdf', plan: 'Pro', isNew: true, status: 'Active', howToUse: ['Upload the password-protected PDF file.', 'Enter the current password for the PDF.', 'Click the "Unlock PDF" button.', 'Download the restriction-free PDF file.'] },
    { name: 'Lock PDF', description: '🔒 Protect your sensitive PDF files with a strong password. Encrypt your documents and set permissions for printing, copying, and editing to maintain confidentiality.', icon: 'Lock', category: 'pdf', plan: 'Pro', isNew: true, status: 'Active', howToUse: ['Upload the PDF file you want to protect.', 'Enter a strong password to encrypt the file.', 'Optionally, set permissions for printing, copying, etc.', 'Click "Lock PDF" to download the secured file.'] },
    { name: 'Unit Converter', description: '📏 Convert between various units of measurement for length, mass, temperature, and more with this versatile and comprehensive tool.', icon: 'Ruler', category: 'calculator', isNew: false, status: 'Active', howToUse: ['Select the type of conversion (e.g., Length, Mass).', 'Enter the value you want to convert in the "From" field.', 'Select the "From" and "To" units from the dropdown menus.', 'The converted value will automatically appear in the "To" field.'] },
    { name: 'Color Picker', description: '🎨 Pick colors from an interactive color wheel or your screen. Instantly get HEX, RGB, HSL, and CMYK codes for your design projects.', icon: 'Pipette', category: 'image', plan: 'Free', isNew: false, status: 'Active', howToUse: ['Use the color wheel to select your desired color.', 'Alternatively, click the color swatch to use your browser\'s native color picker.', 'The corresponding HEX, RGB, and HSL values will be displayed.', 'Click the "Copy" button next to any value to copy it.'] },
    { name: 'Text Repeater', description: '🔁 Repeat a piece of text multiple times with optional new lines. Perfect for creating test data, generating patterns, or for creative purposes.', icon: 'Repeat', category: 'text', plan: 'Free', isNew: false, status: 'Active', howToUse: ['Enter the text you want to repeat.', 'Specify the number of repetitions.', 'Choose whether to add a new line after each repetition.', 'Click "Repeat Text" to see the result.'] },
    { name: 'Age Calculator', description: '🎂 Calculate your exact age in years, months, and days from your date of birth instantly. Also shows the countdown to your next birthday.', icon: 'Gift', category: 'calculator', isNew: false, status: 'Active', howToUse: ['Select your date of birth using the calendar.', 'The tool will automatically calculate and display your age in years, months, and days.', 'It will also show how many days are left until your next birthday.'] },
    { name: 'Amazon Shipping Label Cropper', description: '📦 Effortlessly crop Amazon FBA labels from 8.5x11 inch to a perfect 4x6 inch format. Ideal for thermal printers and streamlining your shipping process.', icon: 'FileUp', category: 'ecommerce', plan: 'Free', isNew: true, status: 'Active', howToUse: ['Upload the standard 8.5" x 11" PDF label from Amazon Seller Central.', 'Click the "Crop Label and Download" button.', 'A new PDF with two 4" x 6" labels will be automatically downloaded.'] },
    { name: 'Myntra Shipping Label Cropper', description: '📦 Quickly convert your standard Myntra shipping labels into a thermal printer-friendly 4x6 inch format. Save time and label paper.', icon: 'Crop', category: 'ecommerce', plan: 'Free', isNew: true, status: 'Active', howToUse: ['Upload the standard PDF label from Myntra.', 'Click the "Crop Myntra Label" button.', 'A new PDF with a 4" x 6" label will be downloaded.'] },
    { name: 'Flipkart Shipping Label Cropper', description: '📦 Crop your Flipkart shipping labels from a full page to a 4x6 inch size in seconds. Perfect for thermal printers and efficient order fulfillment.', icon: 'Crop', category: 'ecommerce', plan: 'Free', isNew: true, status: 'Active', howToUse: ['Upload the standard PDF label from Flipkart.', 'Click the "Crop Flipkart Label" button.', 'A new PDF with a 4" x 6" label will be downloaded.'] },
    { name: 'Meesho Shipping Label Cropper', description: '📦 Optimize your Meesho shipping process by cropping default labels to a 4x6 inch format. A must-have tool for Meesho sellers using thermal printers.', icon: 'Crop', category: 'ecommerce', plan: 'Free', isNew: true, status: 'Active', howToUse: ['Upload the standard PDF label from Meesho.', 'Click the "Crop Meesho Label" button.', 'A new PDF with a 4" x 6" label will be downloaded.'] },
    { name: 'Base64 Converter', description: '🔄 Encode your text and data into Base64 format or decode Base64 strings back to their original form. A crucial tool for developers working with web data.', icon: 'Package', category: 'dev', plan: 'Free', isNew: true, status: 'Active', howToUse: ['Enter text in the input box.', 'Click "Encode" to convert it to Base64.', 'Alternatively, paste a Base64 string in the input box and click "Decode".', 'Use the "Swap" button to switch between input and output.'] },
    { name: 'Binary to Text', description: '🔡 Convert binary code into readable ASCII text. Quickly decode binary data into a human-readable format for debugging or analysis.', icon: 'Binary', category: 'dev', plan: 'Free', isNew: true, status: 'Active', howToUse: ['Enter the binary code (e.g., 01001000 01100101 01101100 01101100 01101111) in the input area.', 'Click the "Convert to Text" button.', 'The corresponding ASCII text will appear in the output area.'] },
    { name: 'Text to Binary', description: '🔢 Convert any text into binary code format. Useful for understanding data representation or for educational purposes in computer science.', icon: 'Binary', category: 'dev', plan: 'Free', isNew: true, status: 'Active', howToUse: ['Enter the text you want to convert into the input area.', 'Click the "Convert to Binary" button.', 'The binary representation of your text will be displayed.'] },
    { name: 'CSS Minifier', description: '⚡ Minify your CSS code to reduce file size, remove comments, and improve your website\'s loading times. A simple step for web performance optimization.', icon: 'FileCode', category: 'dev', plan: 'Free', isNew: true, status: 'Active', howToUse: ['Paste your CSS code into the "Original CSS" box.', 'Click the "Minify CSS" button.', 'The minified code will appear in the "Minified CSS" box.', 'Click "Copy" to use the minified code.'] },
    { name: 'Discount Calculator', description: '💰 Easily calculate the final price after a discount. See exactly how much money you save on your purchases during sales or promotions.', icon: 'BadgePercent', category: 'calculator', plan: 'Free', isNew: true, status: 'Active', howToUse: ['Enter the original price of the item.', 'Enter the discount percentage.', 'Click the "Calculate" button.', 'View the final price and the amount you saved.'] },
    { name: 'Date Calculator', description: '📅 Calculate the duration between two dates or find a future/past date by adding or subtracting days, months, and years. Useful for project planning and event scheduling.', icon: 'CalendarDays', category: 'calculator', plan: 'Free', isNew: true, status: 'Active', howToUse: ['Select the "Add/Subtract" or "Duration" tab.', 'For Add/Subtract: Pick a start date and enter the years, months, or days to add or subtract.', 'For Duration: Pick a start and end date.', 'Click the appropriate button to see the calculated result.'] },
    { name: 'Compress PDF', description: '🗜️ Reduce the file size of your PDF documents without sacrificing quality. Makes your PDFs easier to share via email or upload to the web.', icon: 'FileArchive', category: 'pdf', plan: 'Pro', isNew: true, status: 'Active', howToUse: ['Upload the PDF file you want to compress.', 'The tool intelligently reduces the file size while maintaining quality.', 'Click the "Compress PDF" button.', 'Download the optimized, smaller PDF file.'] },
    { name: 'Excel to PDF', description: '📄 Convert your Microsoft Excel spreadsheets (.xls, .xlsx) into professional-looking, universally shareable PDF documents.', icon: 'FileSpreadsheet', category: 'pdf', plan: 'Free', isNew: true, status: 'Active', howToUse: ['Upload your Excel file (.xls or .xlsx).', 'The tool will automatically convert it to a PDF.', 'Click the "Download PDF" button to save your file.'] },
    { name: 'Reverse Text', description: '🔄 Reverse your text in various ways. Options include reversing all characters, reversing words only, or reversing the letter order within words.', icon: 'ArrowLeftRight', category: 'text', plan: 'Free', isNew: true, status: 'Active', howToUse: ['Paste your text into the text area.', 'Click the button for the type of reversal you want (e.g., Reverse Text, Reverse Words).', 'The text in the box will be instantly updated.'] },
    { name: 'Remove Extra Spaces', description: '🧹 Clean up your text by automatically removing unnecessary spaces, tabs, and line breaks. Instantly format messy text for a clean, professional look.', icon: 'Eraser', category: 'text', plan: 'Free', isNew: true, status: 'Active', howToUse: ['Paste your text into the "Original Text" box.', 'Optionally, check the box to also remove line breaks.', 'Click "Remove Extra Spaces".', 'The cleaned text will appear in the "Cleaned Text" box.'] },
    { name: 'Find and Replace', description: '🔍 Quickly find and replace specific words or phrases within a body of text. Includes case-sensitive options for precise replacements.', icon: 'SearchCode', category: 'text', plan: 'Free', isNew: true, status: 'Active', howToUse: ['Paste your text into the main text area.', 'Enter the word or phrase to find in the "Find" field.', 'Enter the new word or phrase in the "Replace With" field.', 'Click "Find & Replace All" to modify the text.'] },
    { name: 'Random Word Generator', description: '🎲 Generate random words for creative writing, brainstorming sessions, games like Pictionary, or for vocabulary practice.', icon: 'Shuffle', category: 'text', plan: 'Free', isNew: true, status: 'Active', howToUse: ['Enter the number of random words you want to generate.', 'Click the "Generate Words" button.', 'A list of random words will appear in the text box below.'] },
    { name: 'Rotate Image', description: '🔄 Rotate an image by 90, 180, or 270 degrees to get the perfect orientation for your needs. Simple and fast.', icon: 'RotateCw', category: 'image', plan: 'Free', isNew: true, status: 'Active', howToUse: ['Upload the image you want to rotate.', 'Click "Rotate Left" or "Rotate Right" to adjust the orientation.', 'Click "Download Rotated Image" to save your result.'] },
    { name: 'Image to Base64', description: '🖼️ Convert an image file (PNG, JPG, etc.) into a Base64 data URI. Easily embed images directly into your HTML or CSS files.', icon: 'Code', category: 'image', plan: 'Free', isNew: true, status: 'Active', howToUse: ['Upload the image file you want to convert.', 'The Base64 data URI will automatically appear in the text box.', 'Click the "Copy" button to copy the Base64 string.'] },
    { name: 'Image Resizer', description: '↔️ Resize your images by specifying new dimensions in pixels or by a percentage of the original size. Maintain aspect ratio to avoid distortion.', icon: 'Scaling', category: 'image', plan: 'Free', isNew: true, status: 'Active', howToUse: ['Upload the image you want to resize.', 'Enter the new width or height in pixels.', 'Check "Maintain aspect ratio" to avoid distortion.', 'Click "Resize & Download" to save your new image.'] },
    { name: 'AdMob Revenue Calculator', description: '📱 Estimate your potential AdMob earnings based on DAU, impressions, eCPM, and other key metrics. A valuable tool for mobile app developers.', icon: 'Calculator', category: 'calculator', plan: 'Free', isNew: true, status: 'Active', howToUse: ['Enter your Daily Active Users (DAU).', 'Provide your ad impressions per DAU and average eCPM.', 'Adjust the match rate and show rate percentages.', 'Click "Calculate Revenue" to see your daily, monthly, and yearly estimates.'] },
    { name: 'AdSense Revenue Calculator', description: '🌐 Estimate your potential AdSense earnings based on page views, Click-Through Rate (CTR), and Cost Per Click (CPC). Useful for bloggers and website owners.', icon: 'Calculator', category: 'calculator', plan: 'Free', isNew: true, status: 'Active', howToUse: ['Enter your daily page views.', 'Provide your average Click-Through Rate (CTR) percentage.', 'Enter your average Cost Per Click (CPC) in dollars.', 'Click "Calculate Revenue" to see your estimated daily, monthly, and yearly earnings.'] },
    { name: 'Find IFSC Code By Bank and City', description: '🏦 Find the IFSC code and other details of a bank branch by selecting the bank and city. A convenient tool for Indian bank searches.', icon: 'Search', category: 'dev', plan: 'Free', isNew: true, status: 'Active', howToUse: ['Select the bank from the dropdown list.', 'Select the city where the branch is located.', 'A list of matching branches with their IFSC codes will be displayed.', 'Use the search box to quickly filter branches.'] },
    { name: 'GST Calculator', description: '🇮🇳 Calculate the Goods and Services Tax (GST) for any amount with customizable tax slabs. Easily add or remove GST from a given price.', icon: 'Calculator', category: 'calculator', plan: 'Free', isNew: true, status: 'Active', howToUse: ['Enter the base amount.', 'Select whether to add or remove GST.', 'Choose the correct GST slab (e.g., 5%, 12%, 18%, 28%).', 'The calculator will show the GST amount and the final price.'] },
    { name: 'Interest Calculator', description: '📈 Calculate simple and compound interest for your investments or loans. See a detailed breakdown and understand the growth of your money.', icon: 'Percent', category: 'calculator', isNew: true, status: 'Active', howToUse: ['Select simple or compound interest.', 'Enter principal, rate, and time.', 'Set compounding frequency for compound interest.', 'View the calculated interest and total amount.'] },
    { name: 'Image Color Extractor', description: '🎨 Extract a complete color palette from any uploaded image. A great tool for designers to find inspiration and create harmonious color schemes.', icon: 'Pipette', category: 'image', isNew: true, status: 'Active', howToUse: ['Upload an image from your device.', 'The tool will analyze the image and display a palette of its most dominant colors.', 'Click on any color swatch to copy its HEX, RGB, or HSL code.'] },
    { name: 'Image Cropper', description: '✂️ Crop your images to your desired dimensions with an easy-to-use visual cropping tool. Perfect for social media posts, profile pictures, and web content.', icon: 'Crop', category: 'image', plan: 'Free', isNew: true, status: 'Active', howToUse: ['Upload the image you want to crop.', 'Drag the corners of the selection box to define your crop area.', 'Click the "Crop Image" button.', 'Download your newly cropped image.'] },
    { name: 'Image Compressor', description: '💨 Reduce the file size of your JPG and PNG images while maintaining the best possible quality. Speed up your website and save storage space.', icon: 'FileArchive', category: 'image', plan: 'Pro', isNew: true, status: 'Active', howToUse: ['Upload a JPG or PNG image.', 'The tool intelligently reduces the file size while maintaining quality.', 'Click "Compress & Download".', 'Your optimized image will be downloaded.'] },
    { name: 'Image Converter', description: '🔄 Convert your images between a wide variety of formats like WEBP, AVIF, and more. A versatile tool for all your image format needs.', icon: 'FileImage', category: 'image', plan: 'Free', isNew: true, status: 'Active', howToUse: ['Upload your source image file.', 'Select the desired output format (e.g., PNG, JPG, WEBP).', 'Click the "Convert & Download" button.', 'Your new image file will be automatically downloaded.'] },
    { name: 'Image to PDF', description: '📑 Convert your JPG, PNG, and other image files into a single, easy-to-share PDF document. Combine multiple images into one file.', icon: 'FileImage', category: 'pdf', plan: 'Free', isNew: true, status: 'Active', howToUse: ['Upload one or more image files.', 'Drag and drop to reorder the images if needed.', 'Click "Convert & Download PDF".', 'A single PDF containing all your images will be created.'] },
    { name: 'PDF Signer', description: '✍️ Sign your PDF documents electronically. Draw your signature, type it out, or upload an image of it to apply to your documents securely.', icon: 'PenSquare', category: 'pdf', plan: 'Pro', isNew: true, status: 'Active', howToUse: ['Upload the PDF document you need to sign.', 'Choose to draw your signature, type it, or upload an image of it.', 'Place your signature on the desired location in the document.', 'Click "Apply & Download" to save the signed PDF.'] },
    { name: 'Rotate PDF', description: '🔄 Rotate all pages or specific pages in your PDF document to the correct orientation. Fix incorrectly scanned or oriented documents with ease.', icon: 'RotateCw', category: 'pdf', plan: 'Pro', isNew: true, status: 'Active', howToUse: ['Upload your PDF file.', 'Select whether to rotate all pages or specific pages.', 'Choose the rotation angle (90, 180, or 270 degrees).', 'Click "Rotate & Download" to get the updated PDF.'] },
    { name: 'Marks To Percentage Calculator', description: '🎓 Convert your exam marks or grades into a standardized percentage score quickly and easily. Useful for students applying for admissions or jobs.', icon: 'Calculator', category: 'calculator', isNew: true, status: 'Active', howToUse: ['Enter the marks you obtained.', 'Enter the total possible marks for the exam.', 'Click "Calculate Percentage".', 'The tool will display your percentage score.'] },
    { name: 'SRM To CGPA Calculator', description: '🎓 Calculate your Cumulative Grade Point Average (CGPA) specifically for SRM University students, using their official grading system.', icon: 'Calculator', category: 'calculator', plan: 'Free', isNew: true, status: 'Active', howToUse: ['Enter your grades and credits for each subject, semester by semester.', 'The tool will use SRM\'s specific grading system to calculate your CGPA.', 'View your semester-wise and cumulative GPA.'] },
    { name: 'CGPA To Marks Calculator', description: '🎓 Convert your CGPA score into an equivalent total marks or percentage based on your university\'s specific conversion formula.', icon: 'Calculator', category: 'calculator', plan: 'Free', isNew: true, status: 'Active', howToUse: ['Enter your CGPA.', 'Select your university or enter the conversion formula (e.g., Percentage = CGPA * 9.5).', 'Click "Convert".', 'The tool will show your equivalent percentage or marks.'] },
    { name: 'GPA To CGPA Calculator', description: '🎓 Calculate your Cumulative Grade Point Average (CGPA) from your semester-wise or yearly GPA scores. A handy tool for tracking academic progress.', icon: 'Calculator', category: 'calculator', plan: 'Free', isNew: true, status: 'Active', howToUse: ['Enter your GPA and total credits for each semester.', 'Click "Calculate CGPA".', 'The tool will show your overall CGPA based on the provided data.'] },
    { name: 'Percentage To CGPA Converter', description: '🎓 Convert your overall percentage into a CGPA score on various scales (e.g., 4.0, 10.0). Essential for applications and academic records.', icon: 'Calculator', category: 'calculator', isNew: true, status: 'Active', howToUse: ['Enter your total percentage.', 'Select the target CGPA scale (e.g., 10-point scale).', 'Click "Convert to CGPA".', 'Your equivalent CGPA will be displayed.'] },
    { name: 'CGPA To GPA Converter', description: '🎓 Convert your CGPA on one scale (e.g., 10) to an equivalent GPA on another scale (e.g., 4.0).', icon: 'Calculator', category: 'calculator', isNew: true, status: 'Active', howToUse: ['Enter your current CGPA and its scale.', 'Enter the target GPA scale you want to convert to.', 'Click "Convert".', 'Your equivalent GPA will be displayed.'] },
    { name: 'PDF Splitter', description: '✂️ Split a large PDF file into multiple smaller files or extract a specific range of pages into a new document. Manage your documents more effectively.', icon: 'Split', category: 'pdf', plan: 'Pro', isNew: true, status: 'Active', howToUse: ['Upload your PDF file.', 'Choose your split option: split by range, fixed ranges, or remove pages.', 'Enter the page numbers or ranges as required.', 'Click "Split PDF" to download your new file(s).'] },
    { name: 'PDF Page Reorder', description: '🔄 Visually rearrange the pages of your PDF document into a new order with a simple drag-and-drop interface. Organize your reports and presentations perfectly.', icon: 'Shuffle', category: 'pdf', plan: 'Pro', isNew: true, status: 'Active', howToUse: ['Upload your PDF file.', 'Thumbnails of all pages will be displayed.', 'Drag and drop the page thumbnails into your desired new order.', 'Click "Save & Download" to get the reordered PDF.'] },
    { name: 'PDF Page Counter', description: '🔢 Quickly and accurately count the total number of pages in any PDF file without needing to open it. Great for large documents.', icon: 'ListOrdered', category: 'pdf', plan: 'Free', isNew: true, status: 'Active', howToUse: ['Upload your PDF document.', 'The tool will instantly analyze the file and display the total number of pages.'] },
    { name: 'PDF Page Numberer', description: '#️⃣ Add customizable page numbers to your PDF documents. Choose position, format, and style to professionalize your files.', icon: 'Hash', category: 'pdf', plan: 'Pro', isNew: true, status: 'Active', howToUse: ['Upload your PDF file.', 'Choose the position for the page numbers (e.g., bottom center).', 'Select the format and starting number.', 'Click "Add Numbers & Download" to get your numbered PDF.'] },
    { name: 'PDF Page Remover', description: '🗑️ Delete one or more specific pages from a PDF document. Create a new, refined file by removing unnecessary or sensitive pages.', icon: 'FileMinus', category: 'pdf', plan: 'Pro', isNew: true, status: 'Active', howToUse: ['Upload your PDF file.', 'Enter the page numbers you want to delete (e.g., "2, 5-7").', 'Click "Remove Pages & Download".', 'A new PDF without the specified pages will be downloaded.'] },
    { name: 'PDF Organizer', description: '🗂️ Visually rearrange, delete, rotate, and organize pages from multiple PDF files into one new, coherent document. The ultimate PDF management tool.', icon: 'Layers', category: 'pdf', plan: 'Pro', isNew: true, status: 'Active', howToUse: ['Upload one or more PDF files.', 'Drag, rotate, or delete page thumbnails from all documents.', 'Arrange them in the desired final order.', 'Click "Create PDF" to merge and download your new document.'] },
    { name: 'Website Screenshot', description: '📸 Take a full-page, high-resolution screenshot of any website by simply entering its URL. Perfect for design reviews, archiving, and analysis.', icon: 'MonitorSmartphone', category: 'dev', plan: 'Free', isNew: true, status: 'Active', howToUse: ['Enter the full URL of the website you want to capture.', 'A high-quality screenshot will be generated automatically.', 'Click the download button to save the resulting image file.'] },
    { name: 'What Is My Browser', description: '🌐 Get detailed information about your web browser, operating system, screen size, IP address, and more. Useful for developers and for reporting technical issues.', icon: 'Globe', category: 'dev', plan: 'Free', isNew: true, status: 'Active', howToUse: ['Simply load the page.', 'The tool will automatically detect and display details about your browser, OS, IP address, and screen resolution.'] },
    { name: 'Negative Marking Calculator', description: '📉 Calculate your final score in exams that use a negative marking scheme for incorrect answers. Know exactly where you stand.', icon: 'Calculator', category: 'calculator', plan: 'Free', isNew: true, status: 'Active', howToUse: ['Enter the total number of questions and marks per correct answer.', 'Input the number of correct and incorrect answers.', 'Specify the negative marks for each wrong answer.', 'The calculator will show your final score.'] },
    { name: 'YouTube Region Restriction Checker', description: '🌍 Check if a YouTube video is blocked or restricted in any country around the world. Know your content\'s global reach.', icon: 'Globe', category: 'video', plan: 'Free', isNew: true, status: 'Active', howToUse: ['Paste the URL of the YouTube video you want to check.', 'Click the "Check Restrictions" button.', 'The tool will display a list of countries where the video is blocked.'] },
    { name: 'YouTube Video Title Extractor', description: '✏️ Quickly grab the full, official title of any YouTube video by simply pasting its URL. Great for content creation and referencing.', icon: 'FileText', category: 'video', plan: 'Free', isNew: true, status: 'Active', howToUse: ['Paste the YouTube video URL into the input field.', 'Click the "Extract Title" button.', 'The video title will appear, ready for you to copy.'] },
    { name: 'YouTube Video Description Extractor', description: '📄 Extract the full description text from any YouTube video by providing its URL.', icon: 'FileText', category: 'video', plan: 'Free', isNew: true, status: 'Active', howToUse: ['Paste the full URL of the YouTube video.', 'Click the "Extract Description" button.', 'The video\'s title and full description will appear below.', 'You can then copy the extracted text.'] },
    { name: 'YouTube Video Thumbnail Downloader', description: '🖼️ Download high-quality thumbnails from any YouTube video. Get images in various resolutions for your projects or archives.', icon: 'Download', category: 'video', plan: 'Free', isNew: true, status: 'Active', howToUse: ['Paste the YouTube video URL.', 'The tool will automatically display all available thumbnail sizes.', 'Click the "Download" button for the resolution you need.'] },
    { name: 'Google Drive Direct Link Generator', description: '🔗 Convert your Google Drive sharing links into permanent, direct download links. Perfect for easy file sharing without the Drive preview page.', icon: 'Link', category: 'dev', plan: 'Free', isNew: true, status: 'Active', howToUse: ['Paste your shareable Google Drive link into the input field.', 'Click the "Generate Direct Link" button.', 'Copy the new link, which will force a download when clicked.'] },
    { name: 'Dropbox Direct Link Generator', description: '🔗 Convert your Dropbox sharing links into permanent, direct download links that start downloading immediately. Simplify file sharing from Dropbox.', icon: 'Link', category: 'dev', plan: 'Free', isNew: true, status: 'Active', howToUse: ['Paste your Dropbox sharing link.', 'The tool will automatically modify it to a direct download link.', 'Copy the new link to share.'] },
    { name: 'OneDrive Direct Link Generator', description: '🔗 Convert your OneDrive sharing links into permanent, direct download links for seamless file sharing. Bypass the OneDrive web interface for downloads.', icon: 'Link', category: 'dev', plan: 'Free', isNew: true, status: 'Active', howToUse: ['Paste your OneDrive sharing link.', 'Click "Generate Direct Link".', 'The tool will provide a new link that initiates a direct download.'] },
    { name: 'NSDL PAN Card Photo and Signature Resizer', description: '🇮🇳 Resize your photo and signature to the exact dimensions and file size required for NSDL PAN card applications. Avoid submission errors.', icon: 'Crop', category: 'miscellaneous', plan: 'Free', isNew: true, status: 'Active', howToUse: ['Upload your photo and signature images separately.', 'The tool will automatically resize them to the NSDL-specified dimensions and file size.', 'Download the perfectly formatted images.'] },
    { name: 'UTI PAN Card Photo and Signature Resizer', description: '🇮🇳 Resize your photo and signature to meet the specific requirements for UTI PAN card applications online. Get your application right the first time.', icon: 'Crop', category: 'miscellaneous', plan: 'Free', isNew: true, status: 'Active', howToUse: ['Upload your photo and signature images.', 'The tool will automatically crop and resize them according to UTI guidelines.', 'Download the ready-to-upload images.'] },
    { name: 'Password Strength Checker', description: '💪 Check the strength and security of your password against common patterns and vulnerabilities. Get instant feedback to create stronger passwords.', icon: 'CheckCheck', category: 'dev', plan: 'Free', isNew: true, status: 'Active', howToUse: ['Type your password into the input field.', 'The tool will instantly analyze its strength and provide feedback.', 'It will check for length, character types, and common patterns.'] },
    { name: 'SHA256 Hash Generator', description: '#️⃣ Generate a secure SHA-256 hash for any text string. Commonly used for data integrity checks, digital signatures, and password storage.', icon: 'Hash', category: 'dev', plan: 'Free', isNew: true, status: 'Active', howToUse: ['Enter any text or string into the input box.', 'The tool will automatically generate the corresponding SHA-256 hash.', 'Copy the generated hash.'] },
    { name: 'Universal Hash Generator', description: '#️⃣ Generate various types of cryptographic hashes for your text, including MD5, SHA1, SHA512, and more. A versatile tool for developers.', icon: 'Hash', category: 'dev', plan: 'Free', isNew: true, status: 'Active', howToUse: ['Enter the text you want to hash.', 'Select the desired hashing algorithm (MD5, SHA1, etc.).', 'The generated hash will be displayed for you to copy.'] },
    { name: 'AES Encryption & Decryption', description: '🔒 Encrypt and decrypt your files using the Advanced Encryption Standard (AES) for maximum security. Protect your sensitive data with a password.', icon: 'Key', category: 'dev', plan: 'Pro', isNew: true, status: 'Active', howToUse: ['Upload the file you want to process.', 'Choose whether to encrypt or decrypt.', 'Enter your secret password.', 'Download the processed file.'] },
    { name: 'Image Shape Converter', description: '🖼️ Convert your images into various creative shapes like circles, stars, hearts, and more. Add a unique touch to your photos and designs.', icon: 'Shapes', category: 'image', plan: 'Free', isNew: true, status: 'Active', howToUse: ['Upload your image.', 'Select the desired shape (e.g., Circle, Heart, Star).', 'The tool will crop your image into that shape with a transparent background.', 'Download the resulting PNG image.'] },
    { name: 'Currency Converter', description: '💱 Convert between different world currencies with up-to-date exchange rates. Essential for travel, online shopping, and business.', icon: 'Coins', category: 'calculator', isNew: true, status: 'Active', howToUse: ['Enter the amount you wish to convert.', 'Select the "From" and "To" currencies from the dropdown lists.', 'The converted amount will be displayed based on real-time exchange rates.'] },
    { name: 'UUID Generator', description: '#️⃣ Generate universally unique identifiers (UUIDs) in various versions for your application needs. Create multiple UUIDs at once.', icon: 'Hash', category: 'dev', plan: 'Free', isNew: true, status: 'Active', howToUse: ['Select the number of UUIDs you want to generate.', 'Click the "Generate UUIDs" button.', 'The new UUIDs will be displayed in the text box for you to copy.'] },
    { name: 'Image Metadata Viewer', description: '📸 View detailed EXIF and other metadata from your images. Discover information like camera settings, location (if available), and date taken.', icon: 'Camera', category: 'image', isNew: true, status: 'Active', howToUse: ['Upload an image file (JPG, PNG, etc.).', 'The tool will extract and display all available metadata.', 'View details like camera model, aperture, ISO, and GPS data if available.'] },
    { name: 'Flip Image', description: '🔄 Flip an image horizontally or vertically to create a mirrored version of your original picture. A simple but essential editing tool.', icon: 'FlipHorizontal', category: 'image', plan: 'Free', isNew: true, status: 'Active', howToUse: ['Upload the image you want to flip.', 'Click "Flip Horizontal" or "Flip Vertical".', 'Download the modified image.'] },
    { name: 'ICO Converter', description: '⭐ Convert your images (PNG, JPG) to the ICO format. Perfect for creating website favicons and application icons.', icon: 'FileHeart', category: 'image', plan: 'Free', isNew: true, status: 'Active', howToUse: ['Upload your source image (preferably square).', 'Click the "Convert & Download .ICO" button.', 'Your new .ico file will be automatically downloaded.'] },
    { name: 'Favicon Checker', description: '❤️ Check if a website has a favicon and preview what it looks like. A quick tool for web developers and designers.', icon: 'Heart', category: 'dev', plan: 'Free', isNew: true, status: 'Active', howToUse: ['Enter the full URL of the website.', 'Click "Check Favicon".', 'The tool will display the favicon if it exists.'] },
    { name: 'Meta Tag Generator', description: '⚙️ Generate meta tags (title, description) for your website to improve SEO and how your pages appear in search results and on social media.', icon: 'Code', category: 'seo', plan: 'Pro', isNew: true, status: 'Active', howToUse: ['Enter your site title and description.', 'The tool will generate the appropriate HTML meta tags.', 'Copy the generated code and paste it into the `<head>` section of your HTML.'] },
    { name: 'Keyword Density Checker', description: '📈 Analyze the keyword density of your text to optimize for SEO. Find out which terms appear most frequently in your content.', icon: 'PieChart', category: 'seo', plan: 'Pro', isNew: true, status: 'Active', howToUse: ['Paste your article or text into the text area.', 'Click "Analyze Text".', 'The tool will show you the most frequent keywords and their density.'] },
    { name: 'Redirect Checker', description: '🔗 Check the full redirect chain and status code (301, 302, etc.) of any URL. An essential tool for SEO audits and link management.', icon: 'Link', category: 'seo', plan: 'Pro', isNew: true, status: 'Active', howToUse: ['Enter one or more URLs (one per line).', 'Click "Check Redirects".', 'View the full redirect path and final status code for each URL.'] },
    { name: 'SERP Checker', description: '🔍 Check the search engine results page (SERP) for a specific keyword in any country. See who is ranking and where your domain appears.', icon: 'Search', category: 'seo', plan: 'Pro', isNew: true, status: 'Active', howToUse: ['Enter a keyword to search for.', 'Select the country for the search.', 'Optionally, enter your domain to see if it ranks.', 'Click "Check Rankings" to see the top results.'] },
    { name: 'Robots Txt Generator', description: '🤖 Create a robots.txt file to guide search engine crawlers. Set rules for different bots and include your sitemap easily. This tool provides a user-friendly interface to build your robots.txt file, helping you control how search engines interact with your site, which is crucial for SEO.', icon: 'FileCode', category: 'seo', plan: 'Pro', isNew: true, status: 'Active', howToUse: ["Select a default policy (Allow or Block all).", "Add specific rules for different user-agents (e.g., Googlebot).", "Enter the full URL to your sitemap.", "The robots.txt content is generated live for you to copy or download."] },
    { name: 'Fuel Cost Calculator', description: '⛽ Estimate the fuel cost for a trip based on distance, fuel efficiency (e.g., km/l), and fuel price. Plan your travel budget with ease.', icon: 'Fuel', category: 'calculator', plan: 'Pro', isNew: true, status: 'Active', howToUse: ['Enter the trip distance, your vehicle\'s fuel efficiency, and the current fuel price.', 'Click "Calculate Fuel Cost".', 'The tool will display the total estimated cost for your trip.'] },
    { name: 'Time Zone Converter', description: '🌍 Convert times between different time zones around the world. A simple and visual tool for scheduling international meetings and calls.', icon: 'Clock', category: 'calculator', plan: 'Free', isNew: true, status: 'Active', howToUse: ['The tool shows the current time in several default time zones.', 'You can add more time zones from the dropdown list.', 'The times update automatically every second.'] },
    { name: 'Title Tag Checker', description: '✔️ Check the length of your title tag in pixels and characters for SEO. See a live preview of how your title will appear on Google search results.', icon: 'Text', category: 'seo', plan: 'Free', isNew: true, status: 'Active', howToUse: ['Enter your proposed title tag in the input field.', 'The tool will instantly show you the character count and estimated pixel width.', 'View the preview of how it might look on a Google search results page.'] },
    { name: 'Unix Timestamp Converter', description: '↔️ Convert Unix timestamps to human-readable dates and vice-versa. A fundamental tool for developers working with time-based data.', icon: 'Clock', category: 'dev', plan: 'Free', isNew: true, status: 'Active', howToUse: ['Enter a Unix timestamp to see the human-readable date.', 'Alternatively, select a date to see the corresponding Unix timestamp.', 'The tool updates in real-time.'] },
    { name: 'JavaScript Minifier', description: '⚡ Minify your JavaScript code to reduce file size and improve loading speed. An essential optimization step for any web project.', icon: 'FileCode', category: 'dev', plan: 'Free', isNew: true, status: 'Active', howToUse: ['Paste your JavaScript code into the "Original" box.', 'Click "Minify JavaScript".', 'Copy the minified code from the "Minified" box.'] },
    { name: 'Word to PDF', description: '📄 Convert Microsoft Word documents (.doc, .docx) to high-quality PDF format. Preserve your formatting and share your documents universally.', icon: 'FileText', category: 'pdf', plan: 'Pro', isNew: true, status: 'Active', howToUse: ['Upload your Word document (.doc or .docx).', 'The tool will automatically convert it to PDF.', 'Click "Download PDF" to save your new file.'] },
    { name: 'PDF to JPG', description: '🖼️ Convert each page of a PDF document into a high-quality JPG image. Download individual images or a ZIP file of all pages.', icon: 'FileImage', category: 'pdf', plan: 'Pro', isNew: true, status: 'Active', howToUse: ['Upload your PDF file.', 'Select which pages you want to convert.', 'Choose the image quality.', 'Download the converted JPG images as a ZIP file.'] },
    { name: 'PDF to Word', description: '✍️ Convert PDF documents to editable Microsoft Word files (.docx). Retains formatting to make editing easy.', icon: 'FileText', category: 'pdf', plan: 'Pro', isNew: true, status: 'Active', howToUse: ['Upload your PDF file.', 'Click "Convert to Word".', 'The tool will process the file and provide a downloadable .docx file.'] },
    { name: 'Morse to Text Translator', description: '💬 Translate Morse code back into readable text. Also lets you hear the sound of the Morse code audio.', icon: 'MessageSquare', isNew: true, status: 'Active', category: 'miscellaneous', howToUse: ['Enter Morse code using dots (.), dashes (-), and slashes (/) for spaces.', 'The translated text will appear automatically.', 'Use the "Play Sound" button to hear the Morse code audio.'] },
    { name: 'Text Encryption and Decryption', description: '🔒 Encrypt and decrypt your text using various algorithms like AES for security. Protect your sensitive messages and data.', icon: 'Key', category: 'dev', plan: 'Pro', isNew: true, status: 'Active', howToUse: ['Enter the text you want to process.', 'Provide a secret key or password.', 'Choose whether to encrypt or decrypt.', 'The result will be displayed in the output box.'] },
    { name: 'GPA To Percentage Converter', description: '🎓 Convert your GPA score back into a percentage using your university\'s specific formula or a standard calculation.', icon: 'Calculator', category: 'calculator', isNew: true, status: 'Active', howToUse: ['Enter your GPA.', 'Select your university or enter a custom conversion formula.', 'The tool will display the equivalent percentage.'] },
    { name: 'PPT to PDF', description: '📄 Convert PowerPoint presentations (.ppt, .pptx) to PDF format. Easily share your slides in a universally accessible format.', icon: 'FileText', category: 'pdf', plan: 'Pro', isNew: true, status: 'Active', howToUse: ['Upload your PowerPoint file (.ppt or .pptx).', 'The file will be converted to PDF.', 'Download your new PDF file.'] },
    { name: 'Text to Morse Code', description: ' Morse code. Convert your text messages into a series of dots and dashes and hear the audio.', icon: 'MessageSquare', category: 'miscellaneous', isNew: true, status: 'Active', howToUse: ['Enter the text you want to convert.', 'The corresponding Morse code will appear automatically.', 'Use the "Play Sound" button to hear the generated Morse code.'] },
    { name: 'Credit Card Interest Calculator', description: '💳 Calculate the interest on your credit card balance and see how long it will take to pay it off. An essential tool for financial planning.', icon: 'CreditCard', category: 'calculator', plan: 'Pro', isNew: true, status: 'Active', howToUse: ['Enter your credit card balance, APR, and your planned monthly payment.', 'The tool will show you how long it will take to pay off and the total interest paid.', 'You can also see an amortization schedule.'] },
    { name: 'YouTube Banner Downloader', description: '🖼️ Download high-quality YouTube channel banners by providing the channel URL. A great tool for designers and marketers.', icon: 'Download', category: 'video', plan: 'Free', isNew: true, status: 'Active', howToUse: ['Paste the YouTube channel URL.', 'Click "Fetch Banner".', 'Preview and download the banner in the highest available resolution.'] },
    { name: 'YouTube Logo Downloader', description: '👤 Download the logo or profile picture of any YouTube channel in high resolution. Simply provide the channel URL.', icon: 'UserCircle', category: 'video', plan: 'Free', isNew: true, status: 'Active', howToUse: ['Paste the YouTube channel URL.', 'Click "Fetch Logo".', 'Download the channel\'s profile picture.'] },
    { name: 'Html Minifier', description: '⚡ Minify your HTML code to reduce file size, remove comments, and improve your website\'s loading times.', icon: 'FileCode', category: 'dev', plan: 'Free', isNew: true, status: 'Active', howToUse: ['Paste your HTML code into the "Original HTML" box.', 'Click the "Minify HTML" button.', 'The minified code will appear in the "Minified HTML" box.', 'Click "Copy" to use the minified code.'] },
    { name: 'Schema Generator', description: '🧾 Generate structured data markup in JSON-LD format. Create FAQ, Article, and Product schemas to enhance your search engine listings.', icon: 'FileJson', category: 'seo', plan: 'Pro', isNew: true, status: 'Active', howToUse: ['Select the schema type you want to create (e.g., FAQ).', 'Fill in the required fields for that schema type.', 'Click "Generate Schema".', 'Copy the generated JSON-LD code.'] },
    { name: 'Crontab Generator', description: '⏰ Interactively generate Crontab expressions for scheduling tasks. A simple way to create complex cron jobs without memorizing the syntax.', icon: 'Clock', category: 'dev', isNew: true, status: 'Active', howToUse: ['Use the dropdowns to select the minute, hour, day, month, and day of the week.', 'As you make selections, the cron expression and a human-readable description are updated in real-time.', 'Copy the generated expression for use in your server.'] },
    { name: 'HTML to Markdown Converter', description: '🔄 Convert HTML code into clean, readable Markdown format. Paste your HTML and get the equivalent Markdown instantly.', icon: 'FileCode', category: 'dev', isNew: true, status: 'Active', howToUse: ['Paste your HTML code into the input box.', 'The converted Markdown will appear in the output box automatically.', 'Copy the Markdown for use in your documents or applications.'] },
    { name: 'Image to Text', description: '👁️ Extract text from any image. Upload a picture and our OCR tool will recognize and pull out the text for you to copy and use.', icon: 'ScanText', category: 'ai', plan: 'Pro', isNew: true, status: 'Active', howToUse: ['Upload an image file containing text.', 'The tool will automatically scan and extract the text.', 'The extracted text will be displayed in a text box, ready to be copied.'] },
    { name: 'Readability Score Checker', description: '📝 Analyze your text to determine its readability score using the Flesch-Kincaid formula. Improve your content for better engagement.', icon: 'BookOpen', category: 'text', isNew: true, status: 'Active', howToUse: ['Paste your text into the input area.', 'The tool will instantly calculate the readability score and grade level.', 'Use the feedback to simplify your writing.'] },
    { name: 'Profit Loss Calculator', description: 'Calculate profit or loss from cost and selling price.', icon: 'Calculator', category: 'calculator', isNew: true, status: 'Active', plan: 'Free' },
    { name: 'SIP Calculator', description: 'Calculate the future value of your SIP investments.', icon: 'TrendingUp', category: 'calculator', isNew: true, status: 'Active', plan: 'Pro' },
    { name: 'FD Calculator', description: 'Calculate the maturity amount of your Fixed Deposit.', icon: 'CalendarDays', category: 'calculator', isNew: true, status: 'Active', plan: 'Free' },
    { name: 'Mutual Fund Calculator', description: 'Estimate the returns on your mutual fund investments.', icon: 'PieChart', category: 'calculator', isNew: true, status: 'Active', plan: 'Pro' },
    { name: 'Sales Tax Calculator', description: 'Easily calculate sales tax for any amount.', icon: 'ShoppingBag', category: 'calculator', isNew: true, status: 'Active', plan: 'Free' },
    { name: 'TDS Calculator', description: 'Calculate Tax Deducted at Source for your income.', icon: 'IndianRupee', category: 'calculator', isNew: true, status: 'Active', plan: 'Free' },
    { name: 'Image Aspect Ratio Calculator', description: 'Calculate the aspect ratio or dimensions of an image.', icon: 'AspectRatio', category: 'image', isNew: true, status: 'Active', plan: 'Free' },
    { name: 'URL Encoder Decoder', description: 'Encode or decode URLs for safe transmission.', icon: 'Link', category: 'dev', isNew: true, status: 'Active', plan: 'Free' },
    { name: 'Spelling Checker', description: 'Check and correct spelling in your text.', icon: 'SpellCheck', category: 'text', isNew: true, status: 'Active', plan: 'Pro' },
    { name: 'Whats Chat URL Generator', description: 'Generate a WhatsApp chat link with a pre-filled message.', icon: 'MessageSquare', category: 'miscellaneous', isNew: true, status: 'Active', plan: 'Free' },
    { name: 'Whats App Group URL Generator', description: 'Generate a WhatsApp group invitation link.', icon: 'Users', category: 'miscellaneous', isNew: true, status: 'Active', plan: 'Free' },
    { name: 'Internet Speed Tester', description: 'Test your internet connection speed.', icon: 'Gauge', category: 'miscellaneous', isNew: true, status: 'Active', plan: 'Free' },
    { name: 'Website Word Counter', description: 'Check the size of any webpage.', icon: 'FileSearch', category: 'seo', isNew: true, status: 'Active', plan: 'Pro' },
    { name: 'Device Information Detector', description: 'Get detailed information about your device.', icon: 'Smartphone', category: 'dev', isNew: true, status: 'Active', plan: 'Free' },
    { name: 'Numbers to Word', description: 'Convert numbers into words.', icon: 'CaseUpper', category: 'text', isNew: true, status: 'Active', plan: 'Free' },
    { name: 'Emoji Remover', description: 'Remove all emojis from your text.', icon: 'Eraser', category: 'text', isNew: true, status: 'Active', plan: 'Free' },
    { name: 'Roman to Number Converter', description: 'Convert Roman numerals to numbers.', icon: 'Hash', category: 'calculator', isNew: true, status: 'Active', plan: 'Free' },
    { name: 'Number to Roman Converter', description: 'Convert numbers to Roman numerals.', icon: 'Hash', category: 'calculator', isNew: true, status: 'Active', plan: 'Free' },
    { name: 'RD Calculator', description: 'Calculate the maturity amount of your Recurring Deposit.', icon: 'Repeat', category: 'calculator', isNew: true, status: 'Active', plan: 'Pro' },
    { name: 'NPS Calculator', description: 'Calculate the future value of your National Pension Scheme investments.', icon: 'Landmark', category: 'calculator', isNew: true, status: 'Active', plan: 'Pro' },
    { name: 'Image Watermark Adder', description: 'Add a custom text or image watermark to your photos. Adjust opacity, position, and size to protect your images.', icon: 'Fingerprint', category: 'image', plan: 'Pro', isNew: true, status: 'Active', howToUse: ['Upload the image you want to watermark.', 'Choose between a text or image watermark.', 'Customize the watermark\'s content, size, and position.', 'Download your watermarked image.'] },
    { name: 'Loan Calculator', description: 'Calculate your loan EMI and total interest payable.', icon: 'Banknote', category: 'calculator', isNew: true, status: 'Active', plan: 'Free' },
    { name: 'XML Sitemap Generator', description: 'Create an XML sitemap for your website to improve SEO.', icon: 'FileCode', category: 'seo', isNew: true, status: 'Active', plan: 'Free' },
    { name: 'IFSC Code to Bank Details', description: 'Get complete bank branch details instantly from an Indian Financial System Code (IFSC). Find the bank name, branch, address, and more.', icon: 'Landmark', category: 'dev', plan: 'Free', isNew: true, status: 'Active', howToUse: ['Enter a valid 11-character IFSC code.', 'Click the "Find Bank Details" button.', 'The tool will display the bank name, branch, address, and other available details.'] },
    { name: 'YouTube Logo Downloader', description: '👤 Download the logo or profile picture of any YouTube channel in high resolution. Simply provide the channel URL.', icon: 'UserCircle', category: 'video', plan: 'Free', isNew: true, status: 'Active', howToUse: ['Paste the YouTube channel URL.', 'Click "Fetch Logo".', 'Download the channel\'s profile picture.'] },
    { name: 'EPF Calculator', description: 'Calculate the maturity amount of your Employee Provident Fund (EPF) account.', icon: 'Landmark', category: 'calculator', plan: 'Free', isNew: true, status: 'Active' },
    { name: 'Gratuity Calculator', description: 'Estimate the gratuity amount you are eligible to receive from your employer.', icon: 'Award', category: 'calculator', plan: 'Free', isNew: true, status: 'Active' },
    { name: 'Inflation Calculator', description: 'Calculate the future value of money and understand the impact of inflation.', icon: 'TrendingUp', category: 'calculator', plan: 'Pro', isNew: true, status: 'Active' },
    { name: 'Loan Affordability Calculator', description: 'Determine how much loan you can afford based on your income and expenses.', icon: 'Banknote', category: 'calculator', plan: 'Pro', isNew: true, status: 'Active' },
    { name: 'NSC Calculator', description: 'Calculate the maturity value of your National Savings Certificate (NSC) investment.', icon: 'FileText', category: 'calculator', plan: 'Free', isNew: true, status: 'Active' },
    { name: 'PPF Calculator', description: 'Calculate the maturity amount of your Public Provident Fund (PPF) investment.', icon: 'ShieldCheck', category: 'calculator', plan: 'Free', isNew: true, status: 'Active' },
    { name: 'SWP Calculator', description: 'Plan your Systematic Withdrawal Plan (SWP) from your mutual fund investments.', icon: 'TrendingDown', category: 'calculator', plan: 'Pro', isNew: true, status: 'Active' },
    { name: 'Retirement Savings Calculator', description: 'Estimate the savings you need for a comfortable retirement.', icon: 'User', category: 'calculator', plan: 'Pro', isNew: true, status: 'Active' },
    { name: 'Mortgage Calculator', description: 'Calculate your monthly mortgage payments.', icon: 'Home', category: 'calculator', plan: 'Pro', isNew: true, status: 'Active' },
    { name: 'Average Calculator', description: 'Calculate the average of a set of numbers.', icon: 'Calculator', category: 'calculator', plan: 'Free', isNew: true, status: 'Active' },
];

const generateSlug = (name: string) => {
    return name.toLowerCase().replace(/ & /g, ' and ').replace(/\s+/g, '-').replace(/[^\w.-]+/g, '');
};

/**
 * Seeds the initial tools into the database if the collection is empty.
 */
export async function seedInitialTools() {
    const adminDb = getAdminDb();
    const toolsCollection = adminDb.collection(TOOLS_COLLECTION);
    
    console.log("Forcing update of all tools in the database...");
    const batch = adminDb.batch();
    initialTools.forEach(tool => {
        const slug = generateSlug(tool.name);
        const docRef = toolsCollection.doc(slug);
        batch.set(docRef, { ...tool, slug, createdAt: FieldValue.serverTimestamp() }, { merge: true });
    });
    await batch.commit();
    console.log(`${initialTools.length} tools force-updated successfully.`);
    return true;
}

interface GetToolsOptions {
  query?: string;
  category?: string;
  limit?: number;
  slug?: string;
  status?: string;
}

const getToolsFn = async (options: GetToolsOptions = {}): Promise<Tool[]> => {
    try {
        const adminDb = getAdminDb();
        if (!adminDb) {
            console.error("Firebase Admin is not initialized. Cannot fetch tools.");
            return [];
        }

        let queryRef: Query = adminDb.collection(TOOLS_COLLECTION);
        
        const snapshot = await queryRef.orderBy('name').get();
        
        if (snapshot.empty && !options.slug && !options.category) {
            const seeded = await seedInitialTools();
            if (seeded) {
                // If we just seeded, we need to fetch the data again.
                const retrySnapshot = await adminDb.collection(TOOLS_COLLECTION).orderBy('name').get();
                return processSnapshot(retrySnapshot, options);
            }
        }
        
        return processSnapshot(snapshot, options);

    } catch(e: any) {
        console.error("Error in getTools:", e.message);
        return [];
    }
};

/**
 * Fetches tools from Firestore with optional filtering and limiting.
 */
export const getTools = async (options: GetToolsOptions = {}): Promise<Tool[]> => {
    // This is now a direct call to the function, removing the cache.
    return getToolsFn(options);
};


function processSnapshot(snapshot: FirebaseFirestore.QuerySnapshot<FirebaseFirestore.DocumentData>, options: GetToolsOptions): Tool[] {
    let tools: Tool[] = [];
    snapshot.docs.forEach(doc => {
        const data = doc.data();
        const tool = ToolSchema.safeParse({ id: doc.id, slug: doc.id, ...data, createdAt: (data.createdAt as Timestamp)?.toDate().toISOString() || new Date().toISOString() });
        if (tool.success) {
            tools.push(tool.data);
        } else {
            console.warn(`Invalid tool data in Firestore with ID ${doc.id}:`, tool.error);
        }
    });
    
    // Manual filtering after fetch
    if (options.slug) {
        tools = tools.filter(tool => tool.slug === options.slug);
    }
     if (options.category && options.category !== 'all') {
        tools = tools.filter(tool => tool.category === options.category);
    }

    // Manual client-side-like filtering for search query
    if (options.query) {
        const lowercasedQuery = options.query.toLowerCase();
        tools = tools.filter(tool => 
            tool.name.toLowerCase().includes(lowercasedQuery) ||
            tool.description.toLowerCase().includes(lowercasedQuery)
        );
    }
    
    // Filter out disabled tools unless a specific slug is requested OR 'all' status is requested
    if (options.status !== 'all' && !options.slug) {
        tools = tools.filter(tool => tool.status !== 'Disabled');
    }
    
    if (options.limit) {
      tools = tools.slice(0, options.limit);
    }

    return tools;
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
    
    if (data.name && !data.slug) { // Only generate slug if not already present, especially for new tools
      data.slug = generateSlug(data.name);
    }
    
    // Validate data before saving
    const validatedData = UpsertToolInputSchema.parse(data);

    if (id) {
      const toolRef = adminDb.collection(TOOLS_COLLECTION).doc(id);
      // Ensure slug is not removed on update
      await toolRef.update({ ...validatedData, slug: id });
       revalidatePath('/tools');
       revalidatePath(`/tools/${id}`);
      return { success: true, message: 'Tool updated successfully.', toolId: id };
    } else {
      if (!data.slug) throw new Error("Slug is required for a new tool.");
      const docRef = adminDb.collection(TOOLS_COLLECTION).doc(data.slug);
      await docRef.set({ ...validatedData, slug: data.slug, createdAt: FieldValue.serverTimestamp() });
       revalidatePath('/tools');
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

        const toolName = doc.data()?.name || toolId;
        const componentName = toolName.replace(/\s+/g, '');
        const componentPath = `src/components/tools/${componentName}.tsx`;
        const logMessage = `
*****************************************************************
ACTION REQUIRED: Tool '${toolName}' deleted from database.
To complete the deletion, please manually delete the following files:
1. Component: ${componentPath}
2. Entry in: src/components/tools/index.ts
3. Entry in: src/app/(public)/tools/[slug]/_components/ToolPageClient.tsx (slugToComponentMap)
*****************************************************************
        `;
        console.log(logMessage);
        
        revalidatePath('/tools');

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

    if (!userDocSnap.exists) {
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

    

    
