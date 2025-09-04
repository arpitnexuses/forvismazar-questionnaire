# Amiri Font Setup for Arabic PDF Export

## Instructions to Enable Amiri Font for Arabic Text in PDF Export

### Option 1: Local Font File (Recommended)

1. **Download Amiri Font:**
   - Go to https://fonts.google.com/specimen/Amiri
   - Click "Download family" to get the TTF files
   - Or download directly from: https://github.com/aliftype/amiri/releases

2. **Add Font to Project:**
   - Create a `fonts` directory in your `public` folder: `public/fonts/`
   - Place `Amiri-Regular.ttf` in `public/fonts/Amiri-Regular.ttf`

3. **Font Structure:**
   ```
   public/
   └── fonts/
       └── Amiri-Regular.ttf
   ```

### Option 2: Using Google Fonts (Fallback)

The code will automatically try to load Amiri from Google Fonts if the local file is not available, but this may have CORS restrictions in some browsers.

### How It Works

1. **Automatic Detection:** The PDF export automatically detects Arabic text
2. **Font Loading:** Tries to load Amiri font from local file first, then Google Fonts
3. **Fallback:** If Amiri is not available, uses Helvetica (which has better Unicode support than default)
4. **Text Rendering:** Arabic text is rendered with proper line breaking and formatting

### Testing

After setting up the font:
1. Export a PDF with Arabic content
2. Check the browser console for "Amiri font loaded successfully" message
3. Verify that Arabic text appears correctly in the PDF

### Troubleshooting

- **Font not loading:** Check that the file path is correct (`public/fonts/Amiri-Regular.ttf`)
- **CORS errors:** Use the local font file instead of Google Fonts
- **Arabic text still distorted:** Ensure the Amiri font file is valid and properly downloaded

### Font Features

Amiri font provides:
- Proper Arabic character rendering
- Right-to-left text support
- Ligature support for Arabic text
- Professional appearance for Arabic documents
