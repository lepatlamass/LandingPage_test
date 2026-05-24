export interface SeoFaq {
  question: string;
  answer: string;
}

export interface SeoPageData {
  slug: string;
  coreTool: string;
  title: string;
  description: string;
  h1: string;
  h1Accent: string;
  subtitle: string;
  faqs: SeoFaq[];
  locales?: Record<string, Partial<Omit<SeoPageData, 'slug' | 'coreTool' | 'locales'>>>;
}

export const seoPages: Record<string, SeoPageData> = {
  // Existing 25 pages
  'compress-pdf-for-email': {
    slug: 'compress-pdf-for-email',
    coreTool: 'compress-pdf',
    title: 'Compress PDF for Email Online Free | Refinedocs',
    description: 'Easily reduce PDF file size to fit email attachment limits. Compress your PDF documents below 25MB instantly without losing quality. 100% free.',
    h1: 'Compress PDF for',
    h1Accent: 'Email Attachments',
    subtitle: 'Reduce the file size of your PDF documents instantly so they fit perfectly within Gmail or Outlook attachment limits. No watermark, no sign-up required.',
    faqs: [
      {
        question: 'What is the maximum attachment size for Gmail?',
        answer: 'Gmail allows you to send up to 25MB in attachments. If your PDF is larger than 25MB, you must compress it or upload it to Google Drive. Our tool reduces file size instantly to help you avoid this issue.'
      },
      {
        question: 'Will compressing my PDF ruin the quality?',
        answer: 'No. We use smart compression algorithms that reduce the file size by optimizing images and removing redundant data while preserving the visual quality of your document.'
      },
      {
        question: 'Is it safe to compress sensitive documents?',
        answer: 'Yes. Your files are processed securely and deleted automatically from our servers after 1 hour. We do not store or read the contents of your documents.'
      }
    ]
  },
  'resize-image-for-linkedin-banner': {
    slug: 'resize-image-for-linkedin-banner',
    coreTool: 'resize',
    title: 'Resize Image for LinkedIn Banner | Free Online Tool',
    description: 'Resize your photo to the exact 1584 x 396 pixels required for a LinkedIn background banner. Fast, free, and no registration needed.',
    h1: 'Resize Image for',
    h1Accent: 'LinkedIn Banner',
    subtitle: 'Ensure your LinkedIn profile looks professional. Automatically resize your background photos to the recommended 1584 x 396 pixels.',
    faqs: [
      {
        question: 'What is the correct size for a LinkedIn banner?',
        answer: 'The recommended dimensions for a LinkedIn personal profile banner are 1584 pixels wide by 396 pixels tall. The maximum file size is 8MB.'
      },
      {
        question: 'What formats are supported for LinkedIn banners?',
        answer: 'LinkedIn supports JPG, PNG, and GIF files. Our tool allows you to upload any standard image format and resize it perfectly.'
      }
    ]
  },
  'fix-blurry-scanned-pdf': {
    slug: 'fix-blurry-scanned-pdf',
    coreTool: 'image-to-text',
    title: 'Fix Blurry Scanned PDF (Extract Text) | Refinedocs',
    description: 'Extract clear, readable text from blurry or low-quality scanned PDFs using our free AI OCR tool.',
    h1: 'Extract Text from',
    h1Accent: 'Blurry Scanned PDFs',
    subtitle: 'Got a low-quality scanned PDF document? Use our AI-powered OCR tool to extract the text accurately and convert it into a clean, editable format.',
    faqs: [
      {
        question: 'Can I extract text from a blurry PDF?',
        answer: 'Yes! Our advanced Optical Character Recognition (OCR) engine can recognize and extract text even from low-resolution or blurry scanned documents.'
      },
      {
        question: 'Do I need to install any software?',
        answer: 'No. The entire OCR and text extraction process runs directly in your web browser. There is no software to install and no account required.'
      }
    ]
  },
  'make-background-transparent-free': {
    slug: 'make-background-transparent-free',
    coreTool: 'bg-remover',
    title: 'Make Background Transparent Free | Refinedocs',
    description: 'Instantly make image backgrounds transparent for free. Perfect for logos, product photos, and graphics.',
    h1: 'Make Image Background',
    h1Accent: 'Transparent',
    subtitle: 'Upload any image and instantly remove its background. Download your subject as a clean, transparent PNG file for free.',
    faqs: [
      {
        question: 'How do I make a background transparent?',
        answer: 'Simply upload your image (JPG or PNG) to our tool. Our AI automatically detects the main subject and removes the background, leaving it transparent.'
      },
      {
        question: 'Is this background remover really free?',
        answer: 'Yes! Our tool is 100% free to use. There are no watermarks added to your images and no hidden subscription fees.'
      }
    ],
    locales: {
      es: {
        title: 'Hacer fondo transparente gratis online | Refinedocs',
        description: 'Haz transparente el fondo de tus imágenes gratis online y al instante. Perfecto para logos, fotos de producto y gráficos.',
        h1: 'Hacer fondo de imagen',
        h1Accent: 'Transparente Gratis',
        subtitle: 'Sube cualquier imagen y elimina su fondo al instante. Descarga el sujeto como un archivo PNG transparente y limpio de forma gratuita.',
        faqs: [
          {
            question: '¿Cómo hacer un fondo transparente?',
            answer: 'Solo sube tu imagen (JPG o PNG) a nuestra herramienta. Nuestra IA detectará automáticamente el sujeto principal y eliminará el fondo, dejándolo transparente.'
          },
          {
            question: '¿Es este eliminador de fondo realmente gratis?',
            answer: '¡Sí! Nuestra herramienta es 100% gratuita. No se añaden marcas de agua a tus imágenes y no hay tarifas de suscripción ocultas.'
          }
        ]
      },
      it: {
        title: 'Rendere sfondo trasparente gratis online | Refinedocs',
        description: 'Rendi lo sfondo delle tue immagini trasparente gratis online e all\'istante. Ideale per loghi, foto di prodotti e grafiche.',
        h1: 'Rendere sfondo immagine',
        h1Accent: 'Trasparente Gratis',
        subtitle: 'Carica qualsiasi immagine e rimuovi il suo sfondo all\'istante. Scarica il soggetto come file PNG trasparente in modo gratuito.',
        faqs: [
          {
            question: 'Come rendere lo sfondo trasparente?',
            answer: 'Basta caricare l\'immagine (JPG o PNG) nel nostro strumento. La nostra IA rileverà automaticamente il soggetto principale e rimuoverà lo sfondo, rendendolo trasparente.'
          },
          {
            question: 'Questo strumento di rimozione dello sfondo è davvero gratuito?',
            answer: 'Sì! Il nostro strumento è gratuito al 100%. Non vengono aggiunte filigrane alle immagini e non ci sono costi di abbonamento nascosti.'
          }
        ]
      },
      fr: {
        title: 'Rendre le fond d\'une image transparent gratuit | Refinedocs',
        description: 'Rendez le fond de vos images transparent gratuitement et instantanément. Idéal pour les logos, les photos de produits et les graphiques.',
        h1: 'Rendre le fond d\'une image',
        h1Accent: 'Transparent Gratuitement',
        subtitle: 'Téléchargez n\'importe quelle image et supprimez son arrière-plan instantanément. Obtenez un fichier PNG transparent et propre gratuitement.',
        faqs: [
          {
            question: 'Comment rendre un arrière-plan transparent ?',
            answer: 'Téléchargez simplement votre image (JPG ou PNG). Notre IA détecte automatiquement le sujet principal et supprime l\'arrière-plan.'
          },
          {
            question: 'Est-ce que cet outil est vraiment gratuit ?',
            answer: 'Oui ! Notre outil est 100 % gratuit. Aucune marque d\'eau n\'est ajoutée et il n\'y a pas de frais cachés.'
          }
        ]
      },
      'pt-PT': {
        title: 'Tornar fundo transparente grátis online | Refinedocs',
        description: 'Torne o fundo das suas imagens transparente gratuitamente e na hora. Ideal para logótipos, fotos de produtos e gráficos.',
        h1: 'Tornar o fundo da imagem',
        h1Accent: 'Transparente Grátis',
        subtitle: 'Carregue qualquer imagem e remova o fundo instantaneamente. Transfira o seu sujeito como um ficheiro PNG transparente e limpo gratuitamente.',
        faqs: [
          {
            question: 'Como tornar um fundo transparente?',
            answer: 'Basta carregar a sua imagem (JPG ou PNG). A nossa IA deteta automaticamente o assunto principal e remove o fundo, tornando-o transparente.'
          },
          {
            question: 'Este removedor de fundo é realmente gratuito?',
            answer: 'Sim! A nossa ferramenta é 100% gratuita. Não são adicionadas marcas de água e não há taxas de subscrição ocultas.'
          }
        ]
      }
    }
  },
  'remove-tiktok-watermark-free': {
    slug: 'remove-tiktok-watermark-free',
    coreTool: 'watermark-remover',
    title: 'Remove TikTok Watermark Online Free | Refinedocs',
    description: 'Easily blur or remove TikTok watermarks from your videos and images for free. No signup needed.',
    h1: 'Remove TikTok Watermark',
    h1Accent: 'For Free',
    subtitle: 'Clean up your downloaded content by quickly blurring or removing TikTok watermarks. Repurpose your content across other platforms.',
    faqs: [
      {
        question: 'How do I remove a TikTok watermark?',
        answer: 'Upload your downloaded image or video, highlight the area where the watermark appears, and click remove. Our tool will seamlessly blur out the watermark.'
      },
      {
        question: 'Will this reduce the quality of my video?',
        answer: 'Our tool strives to maintain the original resolution. Only the selected watermark area is modified to blend in with the surrounding pixels.'
      }
    ]
  },
  'compress-pdf-under-100kb': {
    slug: 'compress-pdf-under-100kb',
    coreTool: 'compress-pdf',
    title: 'Compress PDF under 100KB Online Free | Refinedocs',
    description: 'Shrink and compress your PDF documents to under 100KB for free. Maintain high resolution and readability with our online PDF size reducer.',
    h1: 'Compress PDF under',
    h1Accent: '100KB Online',
    subtitle: 'Need to upload a PDF with strict size limits? Easily shrink your PDF file size to under 100KB while preserving text sharpness.',
    faqs: [
      {
        question: 'How can I compress a PDF to less than 100KB?',
        answer: 'Upload your PDF to our compressor, select the "Extreme" compression level, and click compress. Our tool will optimize images and fonts to reduce the size below 100KB.'
      },
      {
        question: 'Will the compressed PDF lose quality?',
        answer: 'While extreme compression reduces image resolution, text and vector elements remain perfectly sharp and readable.'
      }
    ]
  },
  'compress-pdf-for-whatsapp': {
    slug: 'compress-pdf-for-whatsapp',
    coreTool: 'compress-pdf',
    title: 'Compress PDF for WhatsApp Online Free | Refinedocs',
    description: 'Reduce PDF file size to send easily on WhatsApp. Compress your documents to fit mobile data and sharing limits instantly.',
    h1: 'Compress PDF for',
    h1Accent: 'WhatsApp Sharing',
    subtitle: 'Make sharing PDFs on mobile quick and data-friendly. Compress your documents instantly to send them on WhatsApp without errors.',
    faqs: [
      {
        question: 'What is the file size limit for WhatsApp documents?',
        answer: 'WhatsApp supports document transfers up to 2GB, but large files consume massive mobile data and load slowly. Compressing to a few megabytes is highly recommended.'
      },
      {
        question: 'Does compressing a PDF affect its formatting?',
        answer: 'No, your document layout, pages, and text formatting will remain completely intact.'
      }
    ]
  },
  'compress-mp4-video-free': {
    slug: 'compress-mp4-video-free',
    coreTool: 'compress-video',
    title: 'Compress MP4 Video Online Free | Refinedocs',
    description: 'Reduce the file size of your MP4 videos online for free. Compress videos without losing quality directly in your browser.',
    h1: 'Compress MP4 Video',
    h1Accent: 'Online Free',
    subtitle: 'Optimize your MP4 video files to load faster and save storage. Compress your videos securely inside your web browser.',
    faqs: [
      {
        question: 'Is my video uploaded to a server for compression?',
        answer: 'No, the entire compression process runs locally in your browser using web assembly (FFmpeg). Your video files never leave your device.'
      },
      {
        question: 'Which video formats are supported?',
        answer: 'We support MP4, MOV, WebM, and AVI formats.'
      }
    ]
  },
  'compress-video-for-discord': {
    slug: 'compress-video-for-discord',
    coreTool: 'compress-video',
    title: 'Compress Video for Discord Free (Under 8MB/25MB) | Refinedocs',
    description: 'Easily compress video files to under 8MB or 25MB to fit Discord upload limits. Free, fast, and secure video optimization.',
    h1: 'Compress Video for',
    h1Accent: 'Discord Sharing',
    subtitle: 'Get past the Discord upload limit error. Compress your videos to under 25MB (or 8MB for classic users) in seconds.',
    faqs: [
      {
        question: 'What is the upload limit for Discord users?',
        answer: 'Standard users can upload files up to 25MB. Nitro users can upload larger files. Our tool optimizes videos to fit these exact limits.'
      },
      {
        question: 'Can I compress MOV files to Discord-compatible MP4?',
        answer: 'Yes, you can choose MP4 as the output format during compression.'
      }
    ]
  },
  'compress-jpeg-to-20kb': {
    slug: 'compress-jpeg-to-20kb',
    coreTool: 'compress-images',
    title: 'Compress JPEG to 20KB Online Free | Refinedocs',
    description: 'Compress JPG/JPEG images to exactly 20KB or less for online forms and profile uploads. Fast, free, and high quality.',
    h1: 'Compress JPEG to',
    h1Accent: '20KB or Less',
    subtitle: 'Struggling with passport or government application form size limits? Compress your JPEG images to under 20KB in one click.',
    faqs: [
      {
        question: 'How do I compress an image to exactly 20KB?',
        answer: 'Upload your image, adjust the quality slider to low (around 30-40%), and hit compress. The tool will calculate the output size dynamically.'
      },
      {
        question: 'Does this support PNG compression?',
        answer: 'Yes, but converting to JPEG is recommended to achieve ultra-small sizes like 20KB.'
      }
    ]
  },
  'png-to-jpg-converter-free': {
    slug: 'png-to-jpg-converter-free',
    coreTool: 'image-converter',
    title: 'Convert PNG to JPG Online Free | Refinedocs',
    description: 'Convert PNG images to JPG format instantly. Perfect for reducing image file size and improving browser compatibility.',
    h1: 'Convert PNG to',
    h1Accent: 'JPG Format',
    subtitle: 'Convert your transparent or heavy PNG files into lightweight, universally compatible JPG images in seconds.',
    faqs: [
      {
        question: 'Will my image transparent background become black?',
        answer: 'Since JPG does not support transparency, transparent areas will automatically turn white, which is standard.'
      },
      {
        question: 'Can I convert multiple PNGs at once?',
        answer: 'Yes, our bulk converter allows you to convert up to 10 images at once.'
      }
    ]
  },
  'convert-heic-to-jpg-free': {
    slug: 'convert-heic-to-jpg-free',
    coreTool: 'heic-to-png',
    title: 'Convert HEIC to JPG Online Free | Refinedocs',
    description: 'Convert Apple iPhone HEIC photos to JPG format online for free. Open your HEIC images on Windows, Android, and web.',
    h1: 'Convert iPhone HEIC',
    h1Accent: 'to JPG Free',
    subtitle: 'Make your Apple photos readable on any device. Convert HEIC files to high-quality JPG images instantly.',
    faqs: [
      {
        question: 'Why can\'t I open my HEIC files on Windows?',
        answer: 'HEIC is a proprietary image format used by Apple. Most Windows, Android, and web applications do not support it natively. Converting them to JPG solves this.'
      },
      {
        question: 'Are my photo metadata and EXIF data preserved?',
        answer: 'Yes, we preserve photo metadata like date, time, and camera details during conversion.'
      }
    ]
  },
  'convert-pdf-to-jpg-high-res': {
    slug: 'convert-pdf-to-jpg-high-res',
    coreTool: 'pdf-to-image',
    title: 'Convert PDF to JPG High Resolution Free | Refinedocs',
    description: 'Convert PDF pages into high-quality JPG or PNG images. Export document pages as crisp pictures for presentations and sharing.',
    h1: 'Convert PDF to',
    h1Accent: 'High-Res JPG',
    subtitle: 'Turn your PDF pages into sharp, clear JPG images at 300 DPI. Perfect for social media, slides, and web uploads.',
    faqs: [
      {
        question: 'What resolution are the generated JPGs?',
        answer: 'We render the PDF pages at high density (300 DPI) to ensure text and graphics remain perfectly readable.'
      },
      {
        question: 'Can I download all pages as a single ZIP file?',
        answer: 'Yes, if your PDF has multiple pages, the tool packages them into a single ZIP for convenient download.'
      }
    ]
  },
  'svg-to-png-transparent-online': {
    slug: 'svg-to-png-transparent-online',
    coreTool: 'svg-to-png',
    title: 'Convert SVG to PNG Transparent Online Free | Refinedocs',
    description: 'Convert vector SVG graphics to transparent PNG images online. Scale and render your vector designs to raster images.',
    h1: 'Convert SVG to',
    h1Accent: 'Transparent PNG',
    subtitle: 'Convert your vector drawings (SVG) to PNG with transparent backgrounds. Set custom resolution scales for web layout exports.',
    faqs: [
      {
        question: 'Can I convert SVG to PNG with a transparent background?',
        answer: 'Yes, our tool preserves the alpha transparency of your vector file.'
      },
      {
        question: 'Can I specify the width and height of the output PNG?',
        answer: 'Yes, you can enter custom dimensions before rendering.'
      }
    ]
  },
  'convert-pdf-to-excel-no-sign-up': {
    slug: 'convert-pdf-to-excel-no-sign-up',
    coreTool: 'pdf-to-excel',
    title: 'Convert PDF to Excel Online Free (No Sign-Up) | Refinedocs',
    description: 'Convert PDF tables into editable Microsoft Excel (XLSX) spreadsheets without registration. Fast, secure, and 100% free.',
    h1: 'Convert PDF to Excel',
    h1Accent: 'Without Sign-Up',
    subtitle: 'Instantly extract tables from PDF documents and import them into Microsoft Excel. No email required, no limits.',
    faqs: [
      {
        question: 'Will the structure of my tables change?',
        answer: 'No, our parser is designed to detect rows and columns precisely, transferring cell values and styling correctly to the Excel file.'
      },
      {
        question: 'Is there a page limit for free users?',
        answer: 'You can convert documents of any size for free.'
      }
    ]
  },
  'convert-pdf-to-word-editable': {
    slug: 'convert-pdf-to-word-editable',
    coreTool: 'pdf-to-word',
    title: 'Convert PDF to Word Editable Document Free | Refinedocs',
    description: 'Convert PDF files to editable DOCX Word files online. Change text, layouts, and tables easily without watermarks.',
    h1: 'Convert PDF to',
    h1Accent: 'Editable Word',
    subtitle: 'Turn static PDF documents into fully editable Microsoft Word files. Re-type and edit documents effortlessly.',
    faqs: [
      {
        question: 'Is the text in the converted Word document editable?',
        answer: 'Yes. If the PDF was generated from a document editor, all text and formatting will be fully editable.'
      },
      {
        question: 'Does it support scanned PDFs?',
        answer: 'Yes, our OCR technology helps extract text from scanned pages.'
      }
    ]
  },
  'convert-word-to-pdf-free': {
    slug: 'convert-word-to-pdf-free',
    coreTool: 'word-to-pdf',
    title: 'Convert Word to PDF Online Free | Refinedocs',
    description: 'Convert Microsoft Word documents (DOC, DOCX) to professional PDF files. Maintain formatting, fonts, and layouts exactly.',
    h1: 'Convert Word to',
    h1Accent: 'PDF Format',
    subtitle: 'Turn your editable Word files into secure, universal PDF documents to share with colleagues and clients.',
    faqs: [
      {
        question: 'Will the formatting change after conversion?',
        answer: 'No. Our converter accurately preserves all margins, fonts, spacing, and image placements.'
      },
      {
        question: 'Can I convert DOC files as well as DOCX?',
        answer: 'Yes, both legacy DOC and modern DOCX files are supported.'
      }
    ]
  },
  'convert-video-to-gif-hd': {
    slug: 'convert-video-to-gif-hd',
    coreTool: 'video-to-gif',
    title: 'Convert Video to GIF HD Free Online | Refinedocs',
    description: 'Make high-quality animated GIFs from videos online. Trim, set frame rate, and export HD GIFs easily.',
    h1: 'Convert Video to',
    h1Accent: 'High-Definition GIF',
    subtitle: 'Turn any video clip into a looping GIF animation. Adjust frame rate, start time, and size for perfect sharing.',
    faqs: [
      {
        question: 'Can I trim the video length?',
        answer: 'Yes, you can specify the exact start and end times to convert only the portion you want.'
      },
      {
        question: 'What frame rate should I choose?',
        answer: 'We recommend 10-15 FPS for a smooth animation with a reasonable file size.'
      }
    ]
  },
  'resize-image-for-instagram-post': {
    slug: 'resize-image-for-instagram-post',
    coreTool: 'resize',
    title: 'Resize Image for Instagram Post | Free Online Tool',
    description: 'Resize your photos to perfect Instagram post dimensions. Square (1:1), portrait (4:5), or landscape (1.91:1) instantly.',
    h1: 'Resize Image for',
    h1Accent: 'Instagram Posts',
    subtitle: 'Prepare your photos for Instagram. Fit them to square (1080x1080) or portrait (1080x1350) sizes without cropping important parts.',
    faqs: [
      {
        question: 'What is the best resolution for Instagram posts?',
        answer: 'The ideal size is 1080 x 1080 pixels (square) or 1080 x 1350 pixels (portrait) for maximum visibility in feeds.'
      },
      {
        question: 'Can I resize multiple images at once?',
        answer: 'Yes, bulk resizing is fully supported.'
      }
    ]
  },
  'resize-image-for-youtube-thumbnail': {
    slug: 'resize-image-for-youtube-thumbnail',
    coreTool: 'resize',
    title: 'Resize Image for YouTube Thumbnail | Free Online',
    description: 'Resize and crop images to the recommended 1280 x 720 pixels YouTube thumbnail size. Fast, free, and easy.',
    h1: 'Resize Image for',
    h1Accent: 'YouTube Thumbnail',
    subtitle: 'Make eye-catching video covers. Resize your custom designs to the official YouTube thumbnail dimensions (1280x720).',
    faqs: [
      {
        question: 'What are the exact dimensions for YouTube thumbnails?',
        answer: 'The recommended resolution is 1280 x 720 pixels with a minimum width of 640 pixels. The aspect ratio must be 16:9.'
      },
      {
        question: 'Is there a maximum file size?',
        answer: 'Yes, YouTube thumbnail files must be under 2MB. Our tool compresses images automatically to help fit this limit.'
      }
    ]
  },
  'add-logo-watermark-to-pdf': {
    slug: 'add-logo-watermark-to-pdf',
    coreTool: 'watermark',
    title: 'Add Logo or Watermark to PDF Free | Refinedocs',
    description: 'Add brand watermark images or text to your PDF documents. Protect your reports, eBooks, and invoices online.',
    h1: 'Add Watermark to',
    h1Accent: 'PDF Documents',
    subtitle: 'Secure your intellectual property. Add custom logos, text stamps, or company watermarks to any PDF for free.',
    faqs: [
      {
        question: 'Can I adjust the transparency of the logo watermark?',
        answer: 'Yes, you can set the opacity from 0% to 100% so it doesn\'t block document text.'
      },
      {
        question: 'Can I apply the watermark to all pages?',
        answer: 'Yes, the watermark will be applied automatically across all pages of the document.'
      }
    ]
  },
  'remove-watermark-from-pdf-free': {
    slug: 'remove-watermark-from-pdf-free',
    coreTool: 'watermark-remover',
    title: 'Remove Watermark from PDF Online Free | Refinedocs',
    description: 'Erase or blur out stamps, watermarks, and unwanted logos from your documents. Clean up files instantly for free.',
    h1: 'Remove Watermark',
    h1Accent: 'from PDF Online',
    subtitle: 'Need a clean version of your document? Quickly remove text stamps, page numbers, or background watermarks for free.',
    faqs: [
      {
        question: 'Does this tool modify the text content?',
        answer: 'No, it only removes or obscures visual elements in the areas you select.'
      },
      {
        question: 'Can I process password-protected PDFs?',
        answer: 'You must unlock the PDF first before removing watermarks.'
      }
    ],
    locales: {
      es: {
        title: 'Quitar marca de agua de PDF online gratis | Refinedocs',
        description: 'Borra o difumina sellos, marcas de agua y logotipos no deseados de tus documentos PDF. Limpia archivos gratis al instante.',
        h1: 'Quitar marca de agua',
        h1Accent: 'de PDF Gratis',
        subtitle: '¿Necesitas una versión limpia de tu documento? Elimina rápidamente sellos de texto, números de página o marcas de agua de fondo de forma gratuita.',
        faqs: [
          {
            question: '¿Esta herramienta modifica el contenido del texto?',
            answer: 'No, solo elimina o difumina los elementos visuales en las áreas que selecciones.'
          },
          {
            question: '¿Puedo procesar PDF protegidos con contraseña?',
            answer: 'Debes desbloquear el PDF primero antes de quitar las marcas de agua.'
          }
        ]
      },
      it: {
        title: 'Rimuovere filigrana da PDF online gratis | Refinedocs',
        description: 'Cancella o sfoca timbri, filigrane e loghi indesiderati dai tuoi documenti PDF. Pulisci i file all\'istante gratuitamente.',
        h1: 'Rimuovere filigrana',
        h1Accent: 'da PDF Online',
        subtitle: 'Hai bisogno di una versione pulita del tuo documento? Rimuovi rapidamente timbri di testo, numeri di pagina o filigrane di sfondo gratuitamente.',
        faqs: [
          {
            question: 'Questo strumento modifica il contenuto del testo?',
            answer: 'No, rimuove o oscura solo gli elementi visivi nelle aree selezionate.'
          },
          {
            question: 'Posso elaborare PDF protetti da password?',
            answer: 'Devi prima sbloccare il PDF prima di rimuovere le filigrane.'
          }
        ]
      },
      fr: {
        title: 'Supprimer filigrane PDF en ligne gratuit | Refinedocs',
        description: 'Effacez ou floutez les tampons, filigranes et logos indésirables de vos documents PDF. Nettoyez vos fichiers gratuitement en ligne.',
        h1: 'Supprimer le filigrane',
        h1Accent: 'de vos PDF en ligne',
        subtitle: 'Besoin d\'une version propre de votre document ? Supprimez rapidement les filigranes de texte ou d\'image gratuitement.',
        faqs: [
          {
            question: 'Cet outil modifie-t-il le texte de mon PDF ?',
            answer: 'Non, il supprime ou estompe uniquement les éléments visuels dans les zones que vous sélectionnez.'
          },
          {
            question: 'Puis-je traiter des PDF protégés par mot de passe ?',
            answer: 'Vous devez d\'abord déverrouiller le PDF avant de pouvoir supprimer les filigranes.'
          }
        ]
      },
      'pt-PT': {
        title: 'Remover marca de água de PDF online grátis | Refinedocs',
        description: 'Apague ou desfoque carimbos, marcas de água e logótipos indesejados dos seus documentos PDF. Limpe ficheiros gratuitamente.',
        h1: 'Remover marca de água',
        h1Accent: 'de PDF Online',
        subtitle: 'Precisa de uma versão limpa do seu documento? Remova rapidamente carimbos de texto, números de página ou marcas de água de fundo.',
        faqs: [
          {
            question: 'Esta ferramenta altera o conteúdo de texto do PDF?',
            answer: 'Não, apenas remove ou desfoca elementos visuais nas áreas que selecionar.'
          },
          {
            question: 'Posso processar PDFs protegidos por palavra-passe?',
            answer: 'Deve desbloquear o PDF primeiro antes de remover as marcas de água.'
          }
        ]
      }
    }
  },
  'extract-text-from-receipt-ocr': {
    slug: 'extract-text-from-receipt-ocr',
    coreTool: 'image-to-text',
    title: 'Extract Text from Receipt (AI OCR Scanner) | Refinedocs',
    description: 'Scan receipts and extract text and numbers instantly using our AI OCR tool. Save receipt data into text files for bookkeeping.',
    h1: 'Extract Text from',
    h1Accent: 'Receipt Scanner',
    subtitle: 'Convert scanned bills, invoices, and expense receipts into clean, copyable text to streamline your finance workflows.',
    faqs: [
      {
        question: 'Can it capture numbers and line items?',
        answer: 'Yes, our OCR technology preserves the layout spacing, making it easy to read columns of prices and item names.'
      },
      {
        question: 'Is my financial information uploaded to third parties?',
        answer: 'No, the OCR engine runs locally inside your browser, ensuring your business financials remain confidential.'
      }
    ]
  },
  'convert-pdf-to-csv-table': {
    slug: 'convert-pdf-to-csv-table',
    coreTool: 'pdf-to-csv',
    title: 'Convert PDF to CSV Table Free Online | Refinedocs',
    description: 'Convert PDF tables into raw CSV data files. Export financial reports, lists, and directories into clean databases.',
    h1: 'Convert PDF to',
    h1Accent: 'CSV Tables',
    subtitle: 'Instantly transform tabular PDF reports into comma-separated values (CSV) for easy data analysis.',
    faqs: [
      {
        question: 'Can I choose the separator character?',
        answer: 'Yes, standard commas are used by default, but you can customize it for compatibility with your target tools.'
      },
      {
        question: 'Will it merge columns?',
        answer: 'No, the layout analyzer splits tables into columns properly.'
      }
    ],
    locales: {
      es: {
        title: 'Convertir PDF a tabla CSV gratis online | Refinedocs',
        description: 'Convierte tablas PDF a archivos de datos CSV raw. Exporta informes financieros, listas y directorios en bases de datos limpias.',
        h1: 'Convertir PDF a',
        h1Accent: 'Tablas CSV',
        subtitle: 'Transforma instantáneamente informes PDF tabulares en valores separados por comas (CSV) para un análisis de datos sencillo.',
        faqs: [
          {
            question: '¿Puedo elegir el carácter separador?',
            answer: 'Sí, por defecto se usan comas estándar, pero puedes personalizarlo para que sea compatible con otras herramientas.'
          },
          {
            question: '¿Se fusionarán las columnas?',
            answer: 'No, el analizador de diseño divide las tablas en columnas correctamente.'
          }
        ]
      },
      it: {
        title: 'Convertire PDF in tabella CSV gratis online | Refinedocs',
        description: 'Converti tabelle PDF in file di dati CSV. Esporta report finanziari, elenchi e directory in database puliti.',
        h1: 'Convertire PDF in',
        h1Accent: 'Tabelle CSV',
        subtitle: 'Trasforma istantaneamente i report PDF in valori separati da virgole (CSV) per una facile analisi dei dati.',
        faqs: [
          {
            question: 'Posso scegliere il carattere separatore?',
            answer: 'Sì, le virgole standard sono utilizzate per impostazione predefinita, ma puoi personalizzarle.'
          },
          {
            question: 'Le colonne verranno unite?',
            answer: 'No, l\'analizzatore di layout suddivide correttamente le tabelle in colonne.'
          }
        ]
      },
      fr: {
        title: 'Convertir PDF en table CSV gratuit en ligne | Refinedocs',
        description: 'Convertissez les tableaux PDF en fichiers de données CSV. Exportez des rapports financiers, des listes et des annuaires en bases de données propres.',
        h1: 'Convertir PDF en',
        h1Accent: 'Tableaux CSV',
        subtitle: 'Transformez instantanément vos rapports PDF tabulaires en valeurs séparées par des virgules (CSV) pour une analyse de données facile.',
        faqs: [
          {
            question: 'Puis-je choisir le caractère séparateur ?',
            answer: 'Oui, les virgules standard sont utilisées par défaut, mais vous pouvez le personnaliser selon vos besoins.'
          },
          {
            question: 'Les colonnes seront-elles fusionnées ?',
            answer: 'Non, notre extracteur divise correctement les tableaux en colonnes distinctes.'
          }
        ]
      },
      'pt-PT': {
        title: 'Converter PDF para tabela CSV online grátis | Refinedocs',
        description: 'Converta tabelas PDF em ficheiros de dados CSV. Exporte relatórios financeiros, listas e diretórios para bases de dados limpas.',
        h1: 'Converter PDF para',
        h1Accent: 'Tabelas CSV',
        subtitle: 'Transforme instantaneamente relatórios PDF tabulares em valores separados por vírgulas (CSV) para uma análise de dados fácil.',
        faqs: [
          {
            question: 'Posso escolher o caractere separador?',
            answer: 'Sim, as vírgulas padrão são usadas por defeito, mas pode personalizá-las para compatibilidade com outras ferramentas.'
          },
          {
            question: 'As colunas serão fundidas?',
            answer: 'Não, o analisador de estrutura divide os quadros em colunas corretamente.'
          }
        ]
      }
    }
  },
  'convert-csv-to-pdf-formatted': {
    slug: 'convert-csv-to-pdf-formatted',
    coreTool: 'csv-to-pdf',
    title: 'Convert CSV to PDF Formatted Report Free | Refinedocs',
    description: 'Convert raw CSV data sheets into beautifully formatted PDF documents. Generate print-ready table files in seconds.',
    h1: 'Convert CSV to',
    h1Accent: 'Formatted PDF',
    subtitle: 'Turn text database exports or CSV spreadsheets into reader-friendly, professional PDF tables for sharing.',
    faqs: [
      {
        question: 'Does it automatically fit pages?',
        answer: 'Yes, we adjust column widths dynamically and wrap text to prevent data clipping in the PDF.'
      },
      {
        question: 'Can I choose landscape mode?',
        answer: 'Yes, landscape orientation is highly recommended for sheets with many columns.'
      }
    ]
  },

  // 20 More SEO Pages (Total 45 pages)
  'compress-pdf-to-1mb': {
    slug: 'compress-pdf-to-1mb',
    coreTool: 'compress-pdf',
    title: 'Compress PDF to 1MB Online Free | Refinedocs',
    description: 'Reduce PDF file size to 1MB or less online for free. Optimize document formatting and images to hit size targets easily.',
    h1: 'Compress PDF to',
    h1Accent: '1MB or Less',
    subtitle: 'Need to compress a large document to exactly 1MB? Adjust your PDF compression settings online and download instantly.',
    faqs: [
      {
        question: 'How do I compress a PDF to 1MB?',
        answer: 'Upload your document, choose "Recommended" or "Extreme" compression, and we will optimize content to reduce the size to 1MB or lower.'
      },
      {
        question: 'Will it remain readable?',
        answer: 'Yes, we balance image resolution with file size so all text remains crisp.'
      }
    ]
  },
  'compress-pdf-for-job-application': {
    slug: 'compress-pdf-for-job-application',
    coreTool: 'compress-pdf',
    title: 'Compress PDF for Job Application Online Free | Refinedocs',
    description: 'Optimize your CV or resume PDF size for job applications. Keep formatting clean and professional while fitting upload limits.',
    h1: 'Compress PDF for',
    h1Accent: 'Job Applications',
    subtitle: 'Don\'t let a large file block your application. Compress your CV, portfolio, and cover letters to professional sizes.',
    faqs: [
      {
        question: 'What is the best PDF size for job applications?',
        answer: 'Most portals limit files to 2MB or 5MB. Keeping your resume under 1MB ensures it uploads quickly and loads instantly for recruiters.'
      },
      {
        question: 'Will my formatting change?',
        answer: 'No, your text, layout, and font designs will be preserved perfectly.'
      }
    ]
  },
  'compress-pdf-without-losing-quality': {
    slug: 'compress-pdf-without-losing-quality',
    coreTool: 'compress-pdf',
    title: 'Compress PDF without Losing Quality Online | Refinedocs',
    description: 'Reduce PDF file size online without losing quality. Keep your text and images sharp while shrinking your documents.',
    h1: 'Compress PDF',
    h1Accent: 'without Quality Loss',
    subtitle: 'Shrink files without compromising professionalism. Our advanced optimizer keeps images sharp and text crisp.',
    faqs: [
      {
        question: 'How do you compress a PDF without losing quality?',
        answer: 'We use lossless optimization techniques to remove metadata, clean up empty elements, and compress images up to their visual threshold.'
      },
      {
        question: 'Is this service free?',
        answer: 'Yes, completely free with no limits or watermarks.'
      }
    ]
  },
  'compress-png-without-losing-quality': {
    slug: 'compress-png-without-losing-quality',
    coreTool: 'compress-images',
    title: 'Compress PNG without Losing Quality Free | Refinedocs',
    description: 'Shrink transparent PNG files without quality loss. Reduce loading times for web designs, logos, and screenshots.',
    h1: 'Compress PNG',
    h1Accent: 'without Quality Loss',
    subtitle: 'Optimize PNG image assets for websites and applications. Shrink file sizes while maintaining pixel-perfect details.',
    faqs: [
      {
        question: 'Does PNG compression support transparent backgrounds?',
        answer: 'Yes, our PNG compressor keeps alpha transparency fully intact.'
      },
      {
        question: 'What is the size savings?',
        answer: 'Typically, PNG files can be reduced by 50% to 70% without any visible changes in quality.'
      }
    ],
    locales: {
      es: {
        title: 'Comprimir PNG sin perder calidad gratis | Refinedocs',
        description: 'Reduce el tamaño de tus archivos PNG transparentes sin perder calidad. Mejora el tiempo de carga de tus diseños web, logos y capturas.',
        h1: 'Comprimir PNG',
        h1Accent: 'sin Perder Calidad',
        subtitle: 'Optimiza tus imágenes PNG para sitios web y aplicaciones. Reduce el tamaño de los archivos manteniendo todos los detalles intactos.',
        faqs: [
          {
            question: '¿La compresión PNG mantiene los fondos transparentes?',
            answer: 'Sí, nuestro compresor PNG mantiene la transparencia alfa completamente intacta.'
          },
          {
            question: '¿Cuánto tamaño se puede ahorrar?',
            answer: 'Por lo general, los archivos PNG se pueden reducir entre un 50% y un 70% sin ningún cambio visual en la calidad.'
          }
        ]
      },
      it: {
        title: 'Comprimere PNG senza perdere qualità gratis | Refinedocs',
        description: 'Ottimizza e comprimi immagini PNG trasparenti senza perdita di qualità. Riduci i tempi di caricamento per siti web, loghi e screenshot.',
        h1: 'Comprimere PNG',
        h1Accent: 'Senza Perdere Qualità',
        subtitle: 'Ottimizza i file immagine PNG per siti web e applicazioni. Riduci le dimensioni del file mantenendo dettagli perfetti.',
        faqs: [
          {
            question: 'La compressione PNG supporta gli sfondi trasparenti?',
            answer: 'Sì, il nostro compressore PNG mantiene completamente intatta la trasparenza alfa.'
          },
          {
            question: 'Qual è il risparmio medio di dimensioni?',
            answer: 'In genere, i file PNG possono essere ridotti dal 50% al 70% senza modifiche visibili alla qualità.'
          }
        ]
      },
      fr: {
        title: 'Compresser PNG sans perte de qualité gratuit | Refinedocs',
        description: 'Réduisez la taille de vos fichiers PNG transparents sans perte de qualité. Améliorez le temps de chargement pour vos designs web.',
        h1: 'Compresser vos fichiers PNG',
        h1Accent: 'Sans Perte de Qualité',
        subtitle: 'Optimisez vos images PNG pour le web et les applications. Réduisez le poids de vos fichiers tout en préservant chaque détail.',
        faqs: [
          {
            question: 'La compression prend-elle en charge la transparence ?',
            answer: 'Oui, notre outil préserve entièrement la transparence alpha des fichiers PNG.'
          },
          {
            question: 'Quel est le gain de poids moyen ?',
            answer: 'Généralement, la taille d\'un fichier PNG peut être réduite de 50 % à 70 % sans aucune différence visuelle.'
          }
        ]
      },
      'pt-PT': {
        title: 'Comprimir PNG sem perder qualidade grátis | Refinedocs',
        description: 'Reduza o tamanho de ficheiros PNG transparentes sem perda de qualidade. Melhore os tempos de carregamento para sites e designs.',
        h1: 'Comprimir PNG',
        h1Accent: 'Sem Perder Qualidade',
        subtitle: 'Otimize imagens PNG para sites e aplicações. Reduza o tamanho dos ficheiros mantendo todos os detalhes dos píxeis.',
        faqs: [
          {
            question: 'A compressão de PNG suporta fundos transparentes?',
            answer: 'Sim, o nosso compressor de PNG mantém a transparência alfa totalmente intacta.'
          },
          {
            question: 'Qual é a poupança média de tamanho?',
            answer: 'Normalmente, os ficheiros PNG podem ser reduzidos de 50% a 70% sem quaisquer alterações visíveis na qualidade.'
          }
        ]
      }
    }
  },
  'compress-gif-animation-online': {
    slug: 'compress-gif-animation-online',
    coreTool: 'compress-images',
    title: 'Compress GIF Animation Online Free | Refinedocs',
    description: 'Optimize and compress animated GIFs online. Reduce file size of looping animations for faster web loading.',
    h1: 'Compress Animated',
    h1Accent: 'GIF Files',
    subtitle: 'Optimize animated GIFs to load instantly on websites, messaging apps, and social networks without losing frames.',
    faqs: [
      {
        question: 'How do you compress a GIF?',
        answer: 'We optimize the color palette and remove duplicate pixels across frames to dramatically reduce file sizes.'
      },
      {
        question: 'Can I upload large GIFs?',
        answer: 'Yes, we support uploading files up to 20MB.'
      }
    ]
  },
  'compress-video-for-email': {
    slug: 'compress-video-for-email',
    coreTool: 'compress-video',
    title: 'Compress Video for Email Attachment Free | Refinedocs',
    description: 'Reduce video file size to send as an email attachment. Compress MP4 or MOV files under Gmail and Outlook limits.',
    h1: 'Compress Video for',
    h1Accent: 'Email Attachments',
    subtitle: 'Shrink video files directly in your browser to avoid mail server bounce-backs. Fit files into standard attachment budgets.',
    faqs: [
      {
        question: 'What is the email attachment limit for videos?',
        answer: 'Most major email providers (Gmail, Yahoo, Outlook) limit attachments to 20MB or 25MB.'
      },
      {
        question: 'Are my videos sent to a server?',
        answer: 'No, video compression runs locally in your browser for 100% privacy.'
      }
    ]
  },
  'compress-mov-video-free': {
    slug: 'compress-mov-video-free',
    coreTool: 'compress-video',
    title: 'Compress MOV Video Online Free | Refinedocs',
    description: 'Reduce Apple MOV video file size online for free. Compress MOV files without quality loss directly in your browser.',
    h1: 'Compress MOV Video',
    h1Accent: 'Online Free',
    subtitle: 'Optimize heavy Apple QuickTime MOV files. Shrink video sizes and convert them to web-friendly formats easily.',
    faqs: [
      {
        question: 'Can I convert MOV to MP4 during compression?',
        answer: 'Yes, our compressor allows you to select the output format as MP4 to improve compatibility.'
      },
      {
        question: 'How much space will I save?',
        answer: 'Often, MOV files can be compressed by 80% or more depending on original bitrates.'
      }
    ]
  },
  'resize-image-for-facebook-cover': {
    slug: 'resize-image-for-facebook-cover',
    coreTool: 'resize',
    title: 'Resize Image for Facebook Cover Photo Free | Refinedocs',
    description: 'Resize your photos to the recommended Facebook cover photo dimensions (851 x 315 px) instantly. Free and online.',
    h1: 'Resize Image for',
    h1Accent: 'Facebook Cover',
    subtitle: 'Make your business page or profile look stunning. Automatically scale cover designs to Facebook recommended dimensions.',
    faqs: [
      {
        question: 'What size is a Facebook cover photo?',
        answer: 'For desktop, Facebook displays cover photos at 851 pixels wide by 315 pixels tall. On mobile, it displays at 640 x 360 px.'
      },
      {
        question: 'Will my photo be stretched?',
        answer: 'We maintain aspect ratios so your image stays crisp and undistorted.'
      }
    ]
  },
  'resize-image-for-twitter-header': {
    slug: 'resize-image-for-twitter-header',
    coreTool: 'resize',
    title: 'Resize Image for Twitter Header (1500 x 500 px) | Refinedocs',
    description: 'Resize photos to the recommended 1500 x 500 px Twitter header image size. Keep your profile looking professional and clean.',
    h1: 'Resize Image for',
    h1Accent: 'Twitter Header',
    subtitle: 'Avoid blurry or cropped profiles. Resize your background graphics to the official X (Twitter) dimensions.',
    faqs: [
      {
        question: 'What are the Twitter banner dimensions?',
        answer: 'The official dimensions are 1500 pixels wide by 500 pixels tall, with an aspect ratio of 3:1.'
      },
      {
        question: 'What image formats are supported?',
        answer: 'JPG and PNG are best. Animation is not supported for headers.'
      }
    ]
  },
  'resize-image-to-passport-size': {
    slug: 'resize-image-to-passport-size',
    coreTool: 'resize',
    title: 'Resize Image to Passport Photo Size Online | Refinedocs',
    description: 'Resize your profile pictures to official passport photo dimensions (2x2 inches or 35x45 mm). Quick, free, and precise.',
    h1: 'Resize Image to',
    h1Accent: 'Passport Size',
    subtitle: 'Prepare your passport photos or visa images. Resize files to official specs for digital applications.',
    faqs: [
      {
        question: 'What are the dimensions of a US passport photo?',
        answer: 'A US passport photo must be exactly 2 x 2 inches (51 x 51 mm) and high resolution.'
      },
      {
        question: 'Can I print the output image?',
        answer: 'Yes, the image is saved at high DPI, suitable for physical printing.'
      }
    ]
  },
  'remove-background-from-logo': {
    slug: 'remove-background-from-logo',
    coreTool: 'bg-remover',
    title: 'Remove Background from Logo Free Online | Refinedocs',
    description: 'Make your logo background transparent. Remove black or white backgrounds from logos instantly for free.',
    h1: 'Remove Background',
    h1Accent: 'from Logos',
    subtitle: 'Prepare your brand logo for websites and flyers. Instantly extract logos from flat color backgrounds.',
    faqs: [
      {
        question: 'Does it support complex backgrounds?',
        answer: 'It works best on clean white or black backgrounds, but our AI also handles color gradients.'
      },
      {
        question: 'Can I download the output as a transparent PNG?',
        answer: 'Yes, it is exported as a transparent PNG file automatically.'
      }
    ]
  },
  'make-product-photo-background-white': {
    slug: 'make-product-photo-background-white',
    coreTool: 'bg-remover',
    title: 'Make Product Photo Background White Online | Refinedocs',
    description: 'Change product photo backgrounds to clean white. Meet Amazon, eBay, and Shopify seller standards instantly for free.',
    h1: 'Make Product Background',
    h1Accent: 'Clean White',
    subtitle: 'Prepare product images for eCommerce. Remove distracting backgrounds and replace them with solid white.',
    faqs: [
      {
        question: 'Does this comply with Amazon standards?',
        answer: 'Yes, Amazon and eBay require pure white backgrounds (RGB 255, 255, 255) for main product listings.'
      },
      {
        question: 'Can I run this on mobile devices?',
        answer: 'Yes, it works natively inside any modern mobile web browser.'
      }
    ]
  },
  'add-draft-watermark-to-pdf': {
    slug: 'add-draft-watermark-to-pdf',
    coreTool: 'watermark',
    title: 'Add DRAFT Watermark to PDF Free Online | Refinedocs',
    description: 'Stamps "DRAFT" or custom text watermarks onto PDF pages. Review documents safely by marking them as drafts.',
    h1: 'Add DRAFT Watermark',
    h1Accent: 'to PDF Online',
    subtitle: 'Clearly indicate that a document is in review. Add semi-transparent DRAFT overlays to PDF pages.',
    faqs: [
      {
        question: 'Can I change the angle of the DRAFT stamp?',
        answer: 'Yes, we support positioning and rotation so the text sits diagonally or centered.'
      },
      {
        question: 'Can I apply it to specific pages?',
        answer: 'By default, it applies to all pages to ensure consistent document security.'
      }
    ]
  },
  'add-confidential-stamp-to-pdf': {
    slug: 'add-confidential-stamp-to-pdf',
    coreTool: 'watermark',
    title: 'Add CONFIDENTIAL Watermark to PDF Free | Refinedocs',
    description: 'Mark your PDF documents as confidential. Place text or image stamps onto pages to prevent unauthorized distribution.',
    h1: 'Add CONFIDENTIAL',
    h1Accent: 'PDF Watermark',
    subtitle: 'Secure corporate financials, contracts, and legal drafts. Add highly visible CONFIDENTIAL stamps to all pages.',
    faqs: [
      {
        question: 'Is this permanent?',
        answer: 'Yes, the watermark is baked directly into the PDF layout structure.'
      },
      {
        question: 'Can I customize the text?',
        answer: 'Yes, you can type "CONFIDENTIAL", "PRIVATE", or custom text.'
      }
    ]
  },
  'remove-watermark-from-pdf-online': {
    slug: 'remove-watermark-from-pdf-online',
    coreTool: 'watermark-remover',
    title: 'Remove Watermark from PDF Online Free | Refinedocs',
    description: 'Erase or blur out stamps, watermarks, and unwanted logos from your documents. Clean up files instantly for free.',
    h1: 'Remove Watermark',
    h1Accent: 'from PDF Online',
    subtitle: 'Need a clean version of your document? Quickly remove text stamps, page numbers, or background watermarks for free.',
    faqs: [
      {
        question: 'Does this tool modify the text content?',
        answer: 'No, it only removes or obscures visual elements in the areas you select.'
      },
      {
        question: 'Can I process password-protected PDFs?',
        answer: 'You must unlock the PDF first before removing watermarks.'
      }
    ]
  },
  'ocr-scan-handwritten-notes-to-text': {
    slug: 'ocr-scan-handwritten-notes-to-text',
    coreTool: 'image-to-text',
    title: 'OCR Scan Handwritten Notes to Text Free | Refinedocs',
    description: 'Convert handwritten notes, whiteboard photos, and letters into digital text online for free with AI OCR.',
    h1: 'Scan Handwritten Notes',
    h1Accent: 'to Digital Text',
    subtitle: 'Digitize your notebooks and meeting minutes. Our OCR scanner extracts text from handwriting with high precision.',
    faqs: [
      {
        question: 'How clear does the handwriting need to be?',
        answer: 'Clear, print-style writing yields the best results. Highly cursive text may require minor manual corrections.'
      },
      {
        question: 'Which image formats are supported?',
        answer: 'We support JPG, PNG, and scanned PDF files.'
      }
    ]
  },
  'convert-scanned-pdf-to-text-free': {
    slug: 'convert-scanned-pdf-to-text-free',
    coreTool: 'image-to-text',
    title: 'Convert Scanned PDF to Text Free Online | Refinedocs',
    description: 'Convert non-selectable scanned PDF documents into copyable text files. Run online OCR without signing up.',
    h1: 'Convert Scanned PDF',
    h1Accent: 'to Selectable Text',
    subtitle: 'Make flat, scanned PDF pages editable and searchable. Instantly extract text columns with precision.',
    faqs: [
      {
        question: 'Can I search the output text?',
        answer: 'Yes, once extracted, you can copy the text or download it as a searchable file.'
      },
      {
        question: 'What languages are supported?',
        answer: 'We support OCR extraction in English, Spanish, French, Italian, and Portuguese.'
      }
    ]
  },
  'convert-heic-to-png-transparent': {
    slug: 'convert-heic-to-png-transparent',
    coreTool: 'heic-to-png',
    title: 'Convert HEIC to PNG Transparent Online Free | Refinedocs',
    description: 'Convert Apple HEIC photos to transparent PNG images. Keep transparency layers and download high-resolution files.',
    h1: 'Convert HEIC to',
    h1Accent: 'Transparent PNG',
    subtitle: 'Convert your HEIC images while retaining alpha transparency channels. High-fidelity rendering in your browser.',
    faqs: [
      {
        question: 'Can HEIC files have transparent backgrounds?',
        answer: 'Yes, modern portrait photos or cropped graphics in iOS can contain transparent areas.'
      },
      {
        question: 'Is this tool free?',
        answer: 'Yes, 100% free with no watermarks.'
      }
    ],
    locales: {
      es: {
        title: 'Convertir HEIC a PNG transparente gratis online | Refinedocs',
        description: 'Convierte fotos Apple HEIC a imágenes PNG transparentes. Conserva las capas de transparencia y descarga archivos en alta resolución.',
        h1: 'Convertir HEIC a',
        h1Accent: 'PNG Transparente',
        subtitle: 'Convierte tus imágenes HEIC conservando los canales de transparencia alfa. Renderizado de alta fidelidad en tu navegador.',
        faqs: [
          {
            question: '¿Los archivos HEIC pueden tener fondos transparentes?',
            answer: 'Sí, las fotos de retrato modernas o los gráficos recortados en iOS pueden contener áreas transparentes.'
          },
          {
            question: '¿Es esta herramienta gratuita?',
            answer: 'Sí, 100% gratis y sin marcas de agua.'
          }
        ]
      },
      it: {
        title: 'Convertire da HEIC a PNG trasparente online gratis | Refinedocs',
        description: 'Converti le foto Apple HEIC in immagini PNG trasparenti online. Mantieni i livelli di trasparenza e scarica file ad alta risoluzione.',
        h1: 'Convertire da HEIC a',
        h1Accent: 'PNG Trasparente',
        subtitle: 'Converti le tue immagini HEIC mantenendo i canali di trasparenza alfa. Rendering ad alta fedeltà direttamente nel browser.',
        faqs: [
          {
            question: 'I file HEIC possono avere sfondi trasparenti?',
            answer: 'Sì, le foto portrait moderne o le grafiche ritagliate in iOS possono contenere aree trasparenti.'
          },
          {
            question: 'Questo strumento è gratuito?',
            answer: 'Sì, gratuito al 100% senza filigrane.'
          }
        ]
      },
      fr: {
        title: 'Convertir HEIC en PNG transparent gratuit | Refinedocs',
        description: 'Convertissez les photos Apple HEIC en images PNG transparentes en ligne. Conservez les couches de transparence et téléchargez en haute résolution.',
        h1: 'Convertir HEIC en',
        h1Accent: 'PNG Transparent',
        subtitle: 'Convertissez vos images HEIC tout en conservant les canaux de transparence alpha. Rendu haute fidélité dans votre navigateur.',
        faqs: [
          {
            question: 'Les fichiers HEIC peuvent-ils avoir un fond transparent ?',
            answer: 'Oui, les photos portrait modernes ou les images détourées sur iOS peuvent contenir des zones transparentes.'
          },
          {
            question: 'Cet outil est-il gratuit ?',
            answer: 'Oui, 100 % gratuit et sans aucune marque d\'eau.'
          }
        ]
      },
      'pt-PT': {
        title: 'Converter HEIC para PNG transparente online grátis | Refinedocs',
        description: 'Converta fotos HEIC da Apple em imagens PNG transparentes online. Mantenha as camadas de transparência e descarregue em alta resolução.',
        h1: 'Converter HEIC para',
        h1Accent: 'PNG Transparente',
        subtitle: 'Converta as suas imagens HEIC mantendo os canais de transparência alfa. Renderização de alta fidelidade no seu browser.',
        faqs: [
          {
            question: 'Os ficheiros HEIC podem ter fundos transparentes?',
            answer: 'Sim, fotos em modo retrato modernas ou elementos recortados no iOS podem conter áreas transparentes.'
          },
          {
            question: 'Esta ferramenta é gratuita?',
            answer: 'Sim, 100% gratuita e sem marcas de água.'
          }
        ]
      }
    }
  },
  'convert-heic-to-webp-free': {
    slug: 'convert-heic-to-webp-free',
    coreTool: 'heic-to-png',
    title: 'Convert HEIC to WebP Online Free | Refinedocs',
    description: 'Convert iPhone HEIC images directly to modern WebP format online. Reduce page loading speeds with optimized web formats.',
    h1: 'Convert HEIC to',
    h1Accent: 'WebP Format',
    subtitle: 'Save disk space and improve site performance. Convert your Apple photos to optimized WebP format instantly.',
    faqs: [
      {
        question: 'What are the benefits of WebP?',
        answer: 'WebP provides superior compression and smaller file sizes compared to JPG and PNG, making it perfect for websites.'
      },
      {
        question: 'Can I batch convert HEIC to WebP?',
        answer: 'Yes, bulk processing is fully supported.'
      }
    ]
  },
  'convert-pdf-to-png-transparent': {
    slug: 'convert-pdf-to-png-transparent',
    coreTool: 'pdf-to-image',
    title: 'Convert PDF to PNG Transparent Online Free | Refinedocs',
    description: 'Convert PDF pages into transparent PNG images. Keep transparent page backgrounds and export crisp graphics.',
    h1: 'Convert PDF to',
    h1Accent: 'Transparent PNG',
    subtitle: 'Turn PDF layouts and diagrams into high-resolution transparent PNG images for vector illustrations.',
    faqs: [
      {
        question: 'How is transparency determined?',
        answer: 'If the PDF page has no solid background color, the output PNG will be rendered with transparent background layers.'
      },
      {
        question: 'Can I download all pages as a ZIP?',
        answer: 'Yes, all pages are exported and zipped together for easy download.'
      }
    ]
  }
};

export const getSeoPageData = (slug: string): SeoPageData | undefined => {
  return seoPages[slug];
};
