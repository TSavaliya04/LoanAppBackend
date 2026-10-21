
"use client";

import { useState, useRef, useEffect } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import { Box, Button, Typography, CircularProgress } from '@mui/material';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import NavigateBeforeIcon from '@mui/icons-material/NavigateBefore';

// Configure worker
pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

interface MobilePDFViewerProps {
    fileUrl: string;
}

const MobilePDFViewer = ({ fileUrl }: MobilePDFViewerProps) => {
    const [numPages, setNumPages] = useState<number | null>(null);
    const [pageNumber, setPageNumber] = useState<number>(1);
    const [scale, setScale] = useState<number>(1.0);
    const [containerWidth, setContainerWidth] = useState<number>(0);
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const updateWidth = () => {
            if (containerRef.current) {
                setContainerWidth(containerRef.current.clientWidth);
            }
        };

        const observer = new ResizeObserver(updateWidth);
        if (containerRef.current) {
            observer.observe(containerRef.current);
            updateWidth();
        }

        return () => {
            observer.disconnect();
        };
    }, []);

    function onDocumentLoadSuccess({ numPages }: { numPages: number }) {
        setNumPages(numPages);
    }

    return (
        <Box sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            height: '100%',
            overflow: 'hidden'
        }}>
            <Box ref={containerRef} sx={{
                flex: 1,
                overflow: 'auto',
                width: '100%',
                display: 'flex',
                justifyContent: 'center',
                bgcolor: '#f5f5f5',
                p: 2
            }}>
                <Document
                    file={fileUrl}
                    onLoadSuccess={onDocumentLoadSuccess}
                    loading={
                        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 200 }}>
                            <CircularProgress sx={{ color: '#7444F5' }} />
                        </Box>
                    }
                    error={
                        <Box sx={{ p: 2, textAlign: 'center' }}>
                            <Typography color="error">Failed to load PDF.</Typography>
                        </Box>
                    }
                >
                    <Page
                        pageNumber={pageNumber}
                        scale={scale}
                        renderTextLayer={false}
                        renderAnnotationLayer={false}
                        width={containerWidth ? Math.min(containerWidth - 32, 600) : Math.min(window.innerWidth - 40, 600)}
                    />
                </Document>
            </Box>

            {/* Controls */}
            {numPages && numPages > 1 && (
                <Box sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 2,
                    p: 2,
                    bgcolor: 'white',
                    width: '100%',
                    justifyContent: 'center',
                    borderTop: '1px solid #e0e0e0'
                }}>
                    <Button
                        disabled={pageNumber <= 1}
                        onClick={() => setPageNumber(prev => prev - 1)}
                        startIcon={<NavigateBeforeIcon />}
                    >
                        Prev
                    </Button>
                    <Typography>
                        Page {pageNumber} of {numPages}
                    </Typography>
                    <Button
                        disabled={pageNumber >= numPages}
                        onClick={() => setPageNumber(prev => prev + 1)}
                        endIcon={<NavigateNextIcon />}
                    >
                        Next
                    </Button>
                </Box>
            )}
        </Box>
    );
};

export default MobilePDFViewer;
