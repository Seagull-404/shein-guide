import pdfplumber

pdf = pdfplumber.open('public/shein-guide5.pdf')
for i, page in enumerate(pdf.pages):
    print(f"\n=== 第 {i+1} 页 ===\n")
    text = page.extract_text()
    if text:
        print(text)
    else:
        print("[此页无文本内容]")
pdf.close()
