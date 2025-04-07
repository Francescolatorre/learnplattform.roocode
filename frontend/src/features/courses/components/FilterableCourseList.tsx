import React, {useState, useMemo, useEffect} from 'react';
import {Box, Typography, TextField, CircularProgress, MenuItem, Select, FormControl, InputLabel, Grid, SelectChangeEvent} from '@mui/material';
import CourseList from '@features/courses/components/CourseList';
import {Course} from '../../../types/common/entities';
import CourseService, {CourseFilterOptions} from '@features/courses/services/courseService';
import {useDebounce} from '../../../hooks/useDebounce';

interface FilterableCourseListProps {
    initialCourses?: Course[];
    title?: string;
    clientSideFiltering?: boolean;
    filterPredicate?: (course: Course, searchTerm: string) => boolean;
    emptyMessage?: string;
    noResultsMessage?: string;
    showStatusFilter?: boolean;
    showCreatorFilter?: boolean;
    onCoursesLoaded?: (courses: Course[]) => void;
}

const FilterableCourseList: React.FC<FilterableCourseListProps> = ({
    initialCourses,
    title = 'Courses',
    clientSideFiltering = false,
    filterPredicate = (course, searchTerm) =>
        course.title.toLowerCase().includes(searchTerm.toLowerCase()),
    emptyMessage = 'No courses available.',
    noResultsMessage = 'No courses match your search criteria.',
    showStatusFilter = false,
    showCreatorFilter = false,
    onCoursesLoaded,
}) => {
    // State für Kurse und Filterung
    const [courses, setCourses] = useState<Course[]>(initialCourses || []);
    const [loading, setLoading] = useState<boolean>(!initialCourses);
    const [error, setError] = useState<string | null>(null);

    // Filter-State
    const [searchTerm, setSearchTerm] = useState('');
    const [status, setStatus] = useState<string>('');
    const [creator, setCreator] = useState<number | null>(null);
    const [page, setPage] = useState(1);

    // Debounce für die Suche, um API-Anfragen zu reduzieren
    const debouncedSearchTerm = useDebounce(searchTerm, 300);

    // Laden der Kurse von der API, wenn keine initialCourses übergeben wurden
    useEffect(() => {
        if (!clientSideFiltering && (!initialCourses || initialCourses.length === 0)) {
            loadCourses();
        }
    }, [clientSideFiltering, initialCourses, debouncedSearchTerm, status, creator, page]);

    // Wenn initialCourses bereitgestellt werden, aktualisieren wir den lokalen State
    useEffect(() => {
        if (initialCourses) {
            setCourses(initialCourses);
        }
    }, [initialCourses]);

    // Callback für geladene Kurse
    useEffect(() => {
        if (onCoursesLoaded && courses.length > 0) {
            onCoursesLoaded(courses);
        }
    }, [courses, onCoursesLoaded]);

    // Funktion zum Laden der Kurse mit den aktuellen Filteroptionen
    const loadCourses = async () => {
        try {
            setLoading(true);
            setError(null);

            const filterOptions: CourseFilterOptions = {
                page,
                page_size: 20,
            };

            if (debouncedSearchTerm) filterOptions.search = debouncedSearchTerm;
            if (status) filterOptions.status = status;
            if (creator) filterOptions.creator = creator;

            const response = await CourseService.fetchCourses(filterOptions);
            setCourses(response.results);
        } catch (err) {
            setError('Failed to load courses.');
            setCourses([]);
        } finally {
            setLoading(false);
        }
    };

    // Suchfeld-Handler
    const handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
        setSearchTerm(event.target.value);
        setPage(1); // Bei neuer Suche zurück zur ersten Seite
    };

    // Status-Filter-Handler
    const handleStatusChange = (event: SelectChangeEvent<string>) => {
        setStatus(event.target.value);
        setPage(1);
    };

    // Client-seitig gefilterte Kurse
    const filteredCourses = useMemo(() => {
        if (!clientSideFiltering) return courses;
        return courses.filter(course => filterPredicate(course, searchTerm));
    }, [clientSideFiltering, courses, searchTerm, filterPredicate]);

    // Render der Komponente
    return (
        <Box>
            <Typography variant="h4" gutterBottom>
                {title}
            </Typography>

            {/* Filteroptionen */}
            <Grid container spacing={2} sx={{mb: 3}}>
                <Grid item xs={12} md={showStatusFilter || showCreatorFilter ? 6 : 12}>
                    <TextField
                        fullWidth
                        label="Search courses"
                        variant="outlined"
                        size="small"
                        value={searchTerm}
                        onChange={handleSearch}
                    />
                </Grid>

                {showStatusFilter && (
                    <Grid item xs={6} md={3}>
                        <FormControl fullWidth size="small">
                            <InputLabel>Status</InputLabel>
                            <Select
                                value={status}
                                onChange={handleStatusChange}
                                label="Status"
                            >
                                <MenuItem value="">All</MenuItem>
                                <MenuItem value="active">Active</MenuItem>
                                <MenuItem value="draft">Draft</MenuItem>
                                <MenuItem value="archived">Archived</MenuItem>
                            </Select>
                        </FormControl>
                    </Grid>
                )}

                {/* Zusätzliche Filter könnten hier hinzugefügt werden */}
            </Grid>

            {/* Anzeige des Loading-Zustands */}
            {loading ? (
                <Box sx={{display: 'flex', justifyContent: 'center', my: 4}}>
                    <CircularProgress />
                </Box>
            ) : error ? (
                <Typography color="error">{error}</Typography>
            ) : filteredCourses.length === 0 ? (
                <Typography>
                    {courses.length === 0 ? emptyMessage : noResultsMessage}
                </Typography>
            ) : (
                <CourseList courses={filteredCourses} />
            )}
        </Box>
    );
};

export default FilterableCourseList;
