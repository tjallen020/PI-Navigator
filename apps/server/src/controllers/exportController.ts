import { Request, Response } from 'express';
import PptxGenJS from 'pptxgenjs';
import { z } from 'zod';

const exportSchema = z.object({
  unit: z.string(),
  problem: z.string(),
  owner: z.string(),
  date: z.string(),
  sections: z.object({
    background: z.string(),
    problemStatement: z.string(),
    currentState: z.string(),
    rootCause: z.string(),
    targetState: z.string(),
    countermeasures: z.string(),
    testResults: z.string(),
    sustainment: z.string(),
    nextSteps: z.string()
  }),
  logoPlaceholder: z.string().optional()
});

export const exportA3 = async (req: Request, res: Response) => {
  const parsed = exportSchema.parse(req.body);
  const pptx = new PptxGenJS();
  const slide = pptx.addSlide();
  slide.addText(`A3 Report – ${parsed.unit} – ${parsed.problem} – ${parsed.date}`, {
    x: 0.25,
    y: 0.2,
    fontSize: 20,
    bold: true
  });

  const grid = [
    ['background', 'problemStatement', 'currentState'],
    ['rootCause', 'targetState', 'countermeasures'],
    ['testResults', 'sustainment', 'nextSteps']
  ];

  const width = 3.1;
  const height = 2.1;
  grid.forEach((row, rowIndex) => {
    row.forEach((key, columnIndex) => {
      const title = key
        .replace(/([A-Z])/g, ' $1')
        .replace(/^./, (char) => char.toUpperCase());
      slide.addShape(pptx.ShapeType.rect, {
        x: 0.25 + columnIndex * (width + 0.1),
        y: 0.8 + rowIndex * (height + 0.1),
        w: width,
        h: height,
        line: { color: '595959', width: 1 },
        fill: { color: 'FFFFFF' }
      });
      slide.addText(`${title}\n${parsed.sections[key as keyof typeof parsed.sections]}`, {
        x: 0.3 + columnIndex * (width + 0.1),
        y: 0.85 + rowIndex * (height + 0.1),
        w: width - 0.1,
        h: height - 0.1,
        fontSize: 12,
        color: '404040'
      });
    });
  });

  const buffer = await pptx.write('nodebuffer');
  res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.presentationml.presentation');
  res.setHeader('Content-Disposition', 'attachment; filename="a3-report.pptx"');
  res.send(buffer);
};
