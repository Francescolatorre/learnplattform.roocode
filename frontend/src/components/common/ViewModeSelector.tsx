import GridViewIcon from '@mui/icons-material/GridView';
import ViewListIcon from '@mui/icons-material/ViewList';
import { Paper, Tabs, Tab } from '@mui/material';
import React from 'react';

interface ViewModeSelectorProps {
  viewMode: 'grid' | 'list';
  onChange: (event: React.SyntheticEvent, newValue: 'grid' | 'list') => void;
}

const ViewModeSelector: React.FC<ViewModeSelectorProps> = ({ viewMode, onChange }) => (
  <Paper sx={{ mb: 3 }}>
    <Tabs
      value={viewMode}
      onChange={onChange}
      indicatorColor="primary"
      textColor="primary"
      sx={{ borderBottom: 1, borderColor: 'divider' }}
    >
      <Tab value="grid" label="Grid View" icon={<GridViewIcon />} iconPosition="start" />
      <Tab value="list" label="List View" icon={<ViewListIcon />} iconPosition="start" />
    </Tabs>
  </Paper>
);

export default ViewModeSelector;
