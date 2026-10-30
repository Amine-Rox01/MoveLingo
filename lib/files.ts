export async function extractText(file:File):Promise<string>{
 if(file.size>8*1024*1024)throw new Error('Please choose a file smaller than 8 MB.');
 const ext=file.name.split('.').pop()?.toLowerCase();let text='';
 if(ext==='txt')text=await file.text();
 else if(ext==='docx'){const mammoth=await import('mammoth/mammoth.browser');text=(await mammoth.extractRawText({arrayBuffer:await file.arrayBuffer()})).value;}
 else if(ext==='pdf'){
  const pdfjs=await import('pdfjs-dist');pdfjs.GlobalWorkerOptions.workerSrc='/pdf.worker.min.mjs';
  const pdf=await pdfjs.getDocument({data:await file.arrayBuffer()}).promise;
  try{if(pdf.numPages>50)throw new Error('Please upload an extract of 50 pages or fewer.');
  for(let i=1;i<=pdf.numPages;i++){const page=await pdf.getPage(i);const c=await page.getTextContent();text+=c.items.map(x=>'str'in x?x.str:'').join(' ')+'\n';}}
  finally{await pdf.destroy()}
 }else throw new Error('Choose a TXT, PDF or DOCX file.');
 if(!text.trim())throw new Error('No readable text was found. For scanned PDFs, paste an OCR transcript instead.');
 if(text.length>16000)throw new Error('This file is longer than 16,000 characters. Upload a relevant extract or paste the section you need.');
 return text.trim();
}

