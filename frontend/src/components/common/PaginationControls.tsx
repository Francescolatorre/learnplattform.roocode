import React from 'react';
import {Box, Pagination} from '@mui/material';

interface PaginationControlsProps {
    totalPages: number;
    currentPage: number;
    onPageChange: (event: React.ChangeEvent<unknown>, page: number) => void;
}

const PaginationControls: React.FC<PaginationControlsProps> = ({totalPages, currentPage, onPageChange}) => (
    totalPages > 1 ? (
        <Box sx={{display: 'flex', justifyContent: 'center', mt: 3, py: 2}}>
            <Pagination
                count={totalPages}
                page={currentPage}
                onChange={onPageChange}
                color="primary"
                showFirstButton
                showLastButton
                size="large"
                data-testid="course-pagination"
            />
        </Box>
    ) : null
);

export default PaginationControls;
