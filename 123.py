#!/usr/bin/env python
# -*- coding:utf-8 -*-
# 需要安装的库
# pip install paddlepaddle -i https://mirrors.aliyun.com/pypi/simple/
# pip install paddleocr -i https://mirrors.aliyun.com/pypi/simple/
# pip install cv2 -i https://mirrors.aliyun.com/pypi/simple/
# pip install numpy -i https://mirrors.aliyun.com/pypi/simple/
# pip install Pillow -i https://mirrors.aliyun.com/pypi/simple/
 
import os
import cv2
import numpy as np
from PIL import Image
from paddleocr import PaddleOCR, draw_ocr
 
 
class DeleteImageWatermark:
    def __init__(self):
        pass
     
    def distinguish_string(self, img_path, lang='ch'):
        """
        得到文字识别结果列表
        img_path: 图片路径
        lang: 默认为识别中文
        return: 返回所有被识别到的文字文本框坐标、文字内容和置信度
        如：[
            [[[1415.0, 977.0], [1482.0, 977.0], [1482.0, 1001.0], [1415.0, 1001.0]], ('小红书', 0.868567168712616)],
            [[[1441.0, 1001.0], [1493.0, 1001.0], [1493.0, 1024.0], [1441.0, 1024.0]], ('小红书', 0.9620211124420166)]
        ]
        """
        orc = PaddleOCR(use_angle_cls=True, lang=lang)
        result = orc.ocr(img_path, cls=True)
        return result
     
    def save_distinguish_result(self, result, img_path, save_path):
        """
        将识别文字的结果输出图片
        """
        image = Image.open(img_path).convert('RGB')
        boxes = [line[0] for line in result]
        txts = [line[1][0] for line in result]
        scores = [line[1][1] for line in result]
        im_show = draw_ocr(image, boxes, txts, scores, font_path='./fonts/simfang.ttf')
        im_show = Image.fromarray(im_show)
        im_show.save(save_path)
     
    def delete_watermark(self, result_list, kw_list, img_path, delete_path):
        """
        将符合目标的水印，模糊化处理
        """
        # 获取所有符合目标的文本框位置
        text_axes_list = []
        for line in result_list:
            for kw in kw_list:
                if kw in line[1][0]:
                    min_width = int(min(line[0][0][0], line[0][3][0]))
                    max_width = int(max(line[0][1][0], line[0][2][0]))
                    min_hight = int(min(line[0][0][1], line[0][1][1]))
                    max_hight = int(max(line[0][2][1], line[0][3][1]))
                    text_axes_list.append([min_width, min_hight, max_width, max_hight])
                    break
        # 去除水印
        delt = 10  # 文本框范围扩大
        img = cv2.imread(img_path, 1)
        tmp_delete_path = delete_path.split('.')[0] + '_test.' + delete_path.split('.')[1]  # 临时图片地址
        cv2.imwrite(tmp_delete_path, img)
        for text_axes in text_axes_list:
            img = cv2.imread(tmp_delete_path, 1)
            hight, width = img.shape[0:2]
            # 截取图片
            min_width = text_axes[0] - delt if text_axes[0] - delt >= 0 else 0
            min_hight = text_axes[1] - delt if text_axes[1] - delt >= 0 else 0
            max_width = text_axes[2] + delt if text_axes[2] + delt <= width else width
            max_hight = text_axes[3] + delt if text_axes[3] + delt <= hight else hight
            cropped = img[min_hight:max_hight, min_width:max_width]  # 裁剪坐标为[y0:y1, x0:x1]
            cv2.imwrite(delete_path, cropped)  # 保存截取的图片
            imgSY = cv2.imread(delete_path, 1)
            # 图片二值化处理，把[200,200,200]-[250,250,250]以外的颜色变成0
            start_rgb = 200
            thresh = cv2.inRange(imgSY, np.array([start_rgb, start_rgb, start_rgb]), np.array([250, 250, 250]))
            # 创建形状和尺寸的结构元素
            kernel = np.ones((3, 3), np.uint8)  # 设置卷积核3*3全是1；将当前的数组作为图像类型来进&#12175;各种操作，就要转换到uint8类型
            # 扩展待修复区域
            hi_mask = cv2.dilate(thresh, kernel, iterations=10)  # 膨胀操作，白色区域增大，iterations迭代次数
            specular = cv2.inpaint(imgSY, hi_mask, 5, flags=cv2.INPAINT_TELEA)
            # imgSY：输入8位1通道或3通道图像。
            # hi_mask：修复掩码，8位1通道图像。非零像素表示需要修复的区域。
            # specular：输出与imgSY具有相同大小和类型的图像。
            # 5：算法考虑的每个点的圆形邻域的半径。
            # flags：NPAINT_NS基于Navier-Stokes的方法、Alexandru Telea的INPAINT_TELEA方法
            cv2.imwrite(delete_path, specular)
            # 覆盖图片
            imgSY = Image.open(delete_path)
            img = Image.open(tmp_delete_path)
            img.paste(imgSY, (min_width, min_hight, max_width, max_hight))
            img.save(tmp_delete_path)
        os.remove(delete_path)
        os.rename(tmp_delete_path, delete_path)
     
    def has_kw(self, result_list, kw_list):
        """
        图片是否包含目标水印，返回匹配到的文字列表
        """
        result_str_list = []
        for line in result_list:
            for kw in kw_list:
                if kw in line[1][0]:
                    result_str_list.append(line[1][0])
                    break
        return result_str_list
 
 
def main(kw_list, img_path, result_path):
    """
    kw_list: 需要识别的文字列表
    img_path: 输入的图片地址
    result_path: 输出去水印的结果图片地址
    """
    d = DeleteImageWatermark()
    # 识别文字
    result = d.distinguish_string(img_path)
    for line in result:
        print(line)  # 打印识别结果：识别到的文字文本框坐标、文字内容和置信度
     
    # 显示文字识别结果
    d.save_distinguish_result(result, img_path, os.path.dirname(__file__) + '/test_01.jpg')
     
    # 是否含有指定水印
    result_str_list = d.has_kw(result, kw_list)
    if len(result_str_list) > 0:
        # 删除水印
        d.delete_watermark(result, kw_list, img_path, result_path)
        print('共有 %d 处水印，都已删除成功!' % len(result_str_list))
        return True
    else:
        print('无指定水印！')
        return False
 
 
if __name__ == '__main__':
    # 图片地址
    #path = os.path.dirname(__file__)
    path=os.getcwd()
    img_path = path + '/去除水印.jpg'
    result_path = path + "/result.jpg"
    # 删除指定水印
    kw_list = [ '快手', '抖音', '网易云']
    main(kw_list, img_path, result_path)
