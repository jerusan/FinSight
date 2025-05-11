def ocr_rebuild_pdf_layout(path, dpi=300, y_tolerance=10):
    pages = convert_from_path(path, dpi=dpi)

    for page_img in pages:
        # Extract OCR data with bounding boxes
        ocr_data = pytesseract.image_to_data(page_img, output_type=pytesseract.Output.DICT)

        lines = defaultdict(list)

        for i in range(len(ocr_data['text'])):
            word = ocr_data['text'][i].strip()
            if not word:
                continue

            x, y = ocr_data['left'][i], ocr_data['top'][i]

            y_group = round(y / y_tolerance) * y_tolerance
            lines[y_group].append((x, word))

        text_lines = []
        for y in sorted(lines.keys()):
            sorted_words = sorted(lines[y], key=lambda x: x[0])
            line_text = ' '.join(word for _, word in sorted_words)
            text_lines.append(line_text)

        yield '\n'.join(text_lines)


def extract_from_pdf_in_batches(path: str, batch_size: int = 5, y_tolerance: int = 1):
    try:
       with pdfplumber.open(path) as pdf:
        total_pages = len(pdf.pages)
        for i in range(0, total_pages, batch_size):
            batch_text = ""
            for j in range(i, min(i + batch_size, total_pages)):
                page = pdf.pages[j]
                chars = page.chars

                lines = defaultdict(list)
                for char in chars:
                    y = round(char["top"] / y_tolerance) * y_tolerance
                    lines[y].append(char)

                sorted_lines = sorted(lines.items(), key=lambda item: item[0])

                for _, line_chars in sorted_lines:
                    line_chars_sorted = sorted(line_chars, key=lambda c: c["x0"])
                    line_text = ''.join(c["text"] for c in line_chars_sorted)
                    batch_text += line_text.rstrip() + "\n"
            yield batch_text
    except Exception as e:
        raise ValueError(f"PDF parsing failed: {e}")

async def parse_with_assistant(text: str):
    try:
        thread = await openai.beta.threads.create()
        thread_id = thread.id
        print("Thread created successfully")
        await openai.beta.threads.messages.create(
            thread_id=thread_id,
            role="user",
            content=text
        )
        print("Message added to thread successfully")
        run = await openai.beta.threads.runs.create(
            thread_id=thread_id,
            assistant_id=os.getenv("ASSISTANT_ID")
        )
        print("Run created successfully")
        while True:
            run_status = await openai.beta.threads.runs.retrieve(
                thread_id=thread_id,
                run_id=run.id
            )
            if run_status.status == "completed":
                break
            elif run_status.status in ["failed", "cancelled", "expired"]:
                raise HTTPException(status_code=500, detail=f"Run failed with status: {run_status.status}")
            await asyncio.sleep(1)  # Wait a bit before polling again

        messages = await openai.beta.threads.messages.list(thread_id=thread_id)
        for message in reversed(messages.data):  # newest last, so we reverse
            if message.role == "assistant":
                reply = message.content[0].text.value  # Assuming text type content
                print("Assistant reply:", reply)
                return reply

        raise HTTPException(status_code=500, detail="No assistant reply found.")

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


 # for i, text_batch in enumerate(ocr_rebuild_pdf_layout(file_location)):
        #     print(text_batch)
        #     insights = await parse_with_assistant(text_batch)
        #     insights_all.append(insights)
        #     print(insights)
        #     await asyncio.sleep(1)  # Optional: rate limiting or throttling