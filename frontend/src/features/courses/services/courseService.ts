import apiService from '@services/api/apiService';
import {Course} from '../../../types/common/entities';
import {IPaginatedResponse} from '../../../types/common/paginatedResponse';

// Filteroption-Interface für erweiterte Suchparameter
export interface CourseFilterOptions {
  search?: string;        // Allgemeiner Suchbegriff
  status?: string;        // Kursstatus (z.B. "active", "draft")
  visibility?: string;    // Sichtbarkeit des Kurses
  creator?: number;       // ID des Erstellers
  sort?: string;          // Sortierfeld und -richtung (z.B. "title" oder "-created_at")
  page?: number;          // Seitennummer für Paginierung
  page_size?: number;     // Anzahl der Einträge pro Seite
}

class CourseService {
  private static BASE_URL = '/api/v1/courses/';

  /**
   * Holt Kurse mit optionalen Filterparametern
   */
  public static async fetchCourses(options?: CourseFilterOptions): Promise<IPaginatedResponse<Course>> {
    let url = this.BASE_URL;

    if (options) {
      const params = new URLSearchParams();

      if (options.search) params.append('search', options.search);
      if (options.status) params.append('status', options.status);
      if (options.visibility) params.append('visibility', options.visibility);
      if (options.creator) params.append('creator', options.creator.toString());
      if (options.sort) params.append('ordering', options.sort);
      if (options.page) params.append('page', options.page.toString());
      if (options.page_size) params.append('page_size', options.page_size.toString());

      const queryString = params.toString();
      if (queryString) {
        url += `?${queryString}`;
      }
    }

    const response = await apiService.get<IPaginatedResponse<Course>>(url);

    if (response && response.results && Array.isArray(response.results)) {
      const courses = response.results.map(this.normalizeCourse);
      return {
        count: response.count,
        next: response.next,
        previous: response.previous,
        results: courses,
      };
    } else {
      return {
        count: 0,
        next: null,
        previous: null,
        results: [],
      };
    }
  }

  /**
   * Holt einen einzelnen Kurs anhand seiner ID
   */
  public static async fetchCourseById(courseId: number): Promise<Course> {
    const response = await apiService.get<Course>(`${this.BASE_URL}${courseId}/`);
    return this.normalizeCourse(response as Course);
  }

  /**
   * Erstellt einen neuen Kurs
   */
  public static async createCourse(course: Partial<Course>): Promise<Course> {
    const response = await apiService.post<Course>(this.BASE_URL, course);
    return this.normalizeCourse(response);
  }

  /**
   * Aktualisiert einen bestehenden Kurs
   */
  public static async updateCourse(courseId: number, course: Partial<Course>): Promise<Course> {
    const response = await apiService.put<Course>(`${this.BASE_URL}${courseId}/`, course);
    return this.normalizeCourse(response);
  }

  /**
   * Löscht einen Kurs
   */
  public static async deleteCourse(courseId: number): Promise<void> {
    await apiService.delete(`${this.BASE_URL}${courseId}/`);
  }

  /**
   * Normalisiert ein Kursobjekt, um einheitliche Datenstruktur zu gewährleisten
   */
  private static normalizeCourse(course: Course): Course {
    return {
      id: course.id,
      title: course.title,
      description: course.description,
      version: typeof course.version === 'string'
        ? parseInt(course.version)
        : course.version,
      learning_objectives: course.learning_objectives,
      prerequisites: course.prerequisites,
      status: course.status,
      visibility: course.visibility,
      created_at: course.created_at,
      updated_at: course.updated_at,
      order: course.order,
      creator: course.creator,
      creator_details: course.creator_details,
    };
  }
}

export default CourseService;
