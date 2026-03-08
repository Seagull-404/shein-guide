from paddleocr import PaddleOCR
import pdfplumber
from PIL import Image
import io
import os

# 初始化 PaddleOCR
print("正在初始化 OCR 引擎...")
ocr = PaddleOCR(use_textline_orientation=True, lang='ch')

# 打开 PDF
pdf_path = 'public/shein-guide5.pdf'
pdf = pdfplumber.open(pdf_path)

print("开始识别 PDF 中的图片文字（前 5 页）...\n")

for page_num, page in enumerate(pdf.pages[:5], 1):  # 只识别前 5 页
    print(f"=== 第 {page_num} 页 ===")
    
    # 提取文本层文字
    text = page.extract_text()
    if text and text.strip():
        print("【文本层内容】")
        print(text)
    
    # 将页面转换为图片进行 OCR
    try:
        print("【正在进行图片 OCR 识别...】")
        im = page.to_image(resolution=150)
        img_bytes = im.original
        
        # 保存为临时图片
        img = Image.open(io.BytesIO(img_bytes))
        temp_img_path = f'temp_page_{page_num}.png'
        img.save(temp_img_path)
        
        # OCR 识别
        result = ocr.ocr(temp_img_path, cls=True)
        
        if result and result[0]:
            print("【图片 OCR 识别内容】")
            for line in result[0]:
                if line:
                    text_content = line[1][0]
                    confidence = line[1][1]
                    if confidence > 0.5:
                        print(f"  {text_content}")
        else:
            print("【图片中未识别到文字】")
        
        # 删除临时图片
        os.remove(temp_img_path)
        
    except Exception as e:
        print(f"【图片识别出错: {e}】")
    
    print()

pdf.close()
print("示例识别完成！")
