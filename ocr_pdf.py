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

print(f"开始识别 PDF 中的图片文字，共 {len(pdf.pages)} 页...\n")

for page_num, page in enumerate(pdf.pages, 1):
    print(f"=== 第 {page_num} 页 ===")
    
    # 提取文本层文字
    text = page.extract_text()
    if text and text.strip():
        print("【文本层内容】")
        print(text)
    
    # 将页面转换为图片进行 OCR
    try:
        print("【正在进行图片 OCR 识别...】")
        
        # 使用 pdf2image 或直接将页面渲染为图片
        page_image = page.to_image(resolution=150)
        
        # 保存为临时文件
        temp_img_path = f'temp_page_{page_num}.png'
        page_image.save(temp_img_path, format='PNG')
        
        # OCR 识别 - 移除 cls 参数
        result = ocr.ocr(temp_img_path)
        
        if result and result[0]:
            print("【图片 OCR 识别内容】")
            recognized_texts = []
            for line in result[0]:
                if line:
                    text_content = line[1][0]
                    confidence = line[1][1]
                    if confidence > 0.5 and text_content.strip():
                        recognized_texts.append(text_content)
            
            if recognized_texts:
                for text_item in recognized_texts:
                    print(f"  {text_item}")
            else:
                print("  （识别到的文字置信度较低或无有效文字）")
        else:
            print("【图片中未识别到文字】")
        
        # 删除临时图片
        if os.path.exists(temp_img_path):
            os.remove(temp_img_path)
        
    except Exception as e:
        print(f"【图片识别出错: {e}】")
    
    print()

pdf.close()
print("识别完成！")
