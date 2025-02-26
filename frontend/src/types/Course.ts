export interface Course {
  id: string;
  name: string;
  category: 'Web Development' | 'Data Science' | 'Cybersecurity';
  description: string;
  imageUrl: string;
}

export interface CourseDetails {
  id: string;
  name: string;
  category: 'Web Development' | 'Data Science' | 'Cybersecurity';
  description: string;
  imageUrl: string;
  modules: {
    id: string;
    name: string;
    description: string;
    imageUrl: string;
  }[];
}
