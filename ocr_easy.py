import easyocr
import pdfplumber
from PIL import Image
import os

print("正在初始化 EasyOCR 引擎（首次运行需要下载模型，请耐心等待）...")
reader = easyocr.Reader(['ch_sim', 'en'], gpu=False)

pdf_path = 'public/shein-guide5.pdf'
pdf = pdfplumber.open(pdf_path)

print(f"\n开始识别 PDF 中的图片文字，共 {len(pdf.pages)} 页...\n")

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
        
        # 渲染页面为图片
        page_image = page.to_image(resolution=150)
        
        # 保存为临时文件
        temp_img_path = f'temp_page_{page_num}.png'
        page_image.save(temp_img_path, format='PNG')
        
        # EasyOCR 识别
        result = reader.readtext(temp_img_path)
        
        if result:
            print("【图片 OCR 识别内容】")
            for detection in result:
                text_content = detection[1]
                confidence = detection[2]
                if confidence > 0.5 and text_content.strip():
                    print(f"  {text_content}")
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
