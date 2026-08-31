// PDF এবং DOCX ফাইল থেকে raw text বের করার helper

export async function extractCvText(buffer: Buffer, fileName: string): Promise<string> {
  const lower = fileName.toLowerCase();

  if (lower.endsWith(".pdf")) {
    // debug-mode এড়াতে সরাসরি lib ফাইল থেকে import করা হচ্ছে
    // @ts-ignore — এই সাব-পাথের জন্য pdf-parse কোনো TypeScript declaration দেয় না
    const pdfParse = (await import("pdf-parse/lib/pdf-parse.js")).default;
    const result = await pdfParse(buffer);
    return result.text || "";
  }

  if (lower.endsWith(".docx")) {
    const mammoth = await import("mammoth");
    const result = await mammoth.extractRawText({ buffer });
    return result.value || "";
  }

  // পুরনো .doc ফরম্যাট ভালোভাবে সাপোর্ট করা যায় না
  return "";
}
