import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { PageContentComponent } from "../../../../survey-tool/app/shared/page-content/page-content.component";
import { ObservatoryService} from "../../services/observatory.service";
import { NewsWrapped, NewsResponse } from './news.model';
import {FormControl, FormGroup, ReactiveFormsModule, Validators} from "@angular/forms";

@Component({
  selector: 'app-news-and-stories',
  standalone: true,
  imports: [CommonModule, PageContentComponent, ReactiveFormsModule],
  templateUrl: './news-and-stories.component.html'
})
export class NewsAndStoriesComponent implements OnInit {

  private route = inject(ActivatedRoute);
  private observatoryService = inject(ObservatoryService);

  stakeholderId: string = null;
  newsItems: NewsWrapped[] = [];
  loading: boolean = true;

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      this.stakeholderId = params['id'];
      if (this.stakeholderId) {
        this.fetchNews();
      }
    });
  }

  fetchNews() {
    this.loading = true;
    this.observatoryService.getStakeholderNews(this.stakeholderId).subscribe({
      next: (res: NewsResponse) => {
        this.newsItems = res.results;
        this.loading = false;
        console.log('News loaded successfully:', this.newsItems);
      },
      error: (err) => {
        console.error('Error fetching news:', err);
        this.loading = false;
      }
    });
  }

  storyForm = new FormGroup({
    id: new FormControl(''),
    title: new FormControl('', [Validators.required]),
    description: new FormControl(''),
    url: new FormControl(''),
    image: new FormControl(''),
    publishDate: new FormControl('', [Validators.required]),
    expiryDate: new FormControl('')
  });

  isUpdateMode = false;

  openAddModal() {
    this.isUpdateMode = false;
    this.storyForm.reset();
  }

  openUpdateModal(item: any) {
    this.isUpdateMode = true;
    const data = { ...item.result };

    if (data.publishDate) {
      data.publishDate = data.publishDate.split('T')[0];
    }
    if (data.expiryDate) {
      data.expiryDate = data.expiryDate.split('T')[0];
    }
    this.storyForm.patchValue(data);
  }
}
