# 활용 가이드 PDF

`OPIc_1000_활용가이드.pdf` (A4 6쪽)의 원본입니다.

- `guide.src.html` — 본문. `__QR__`, `__ICON__` 자리에 base64 이미지가 들어갑니다.
- `qr.png` — 표지 QR (앱 주소 인코딩)

## 다시 만들기

Pretendard 폰트를 base64로 인라인한 `fonts.css`가 필요하며,
헤드리스 크로미움으로 A4 PDF를 출력합니다.

```
# 1) 폰트 3종을 받아 base64 @font-face로 fonts.css 생성
# 2) guide.src.html의 __QR__ / __ICON__ 치환 → guide.html
# 3) playwright page.pdf({format:'A4', printBackground:true, preferCSSPageSize:true})
```

가이드에 적힌 복습 간격 수치는 `src/template.html`의 `schedule()` 함수를
그대로 시뮬레이션해 검증한 값입니다. 알고리즘을 바꾸면 PDF의 표도 함께 고쳐야 합니다.
