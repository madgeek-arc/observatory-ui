import { Component, DestroyRef, OnInit, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { PageContentComponent } from "../../../../../survey-tool/app/shared/page-content/page-content.component";
import { StakeholderNewsService } from "../../../services/stakeholder-news.service";
import { NewsWrapped, NewsResponse } from '../../../../domain/news';
import {FormControl, FormGroup, ReactiveFormsModule, Validators} from "@angular/forms";

@Component({
  selector: 'app-news-and-stories',
  standalone: true,
  imports: [CommonModule, PageContentComponent, ReactiveFormsModule],
  templateUrl: './news-and-stories.component.html'
})
export class NewsAndStoriesComponent implements OnInit {

  private route = inject(ActivatedRoute);
  private stakeholderNewsService = inject(StakeholderNewsService);
  private destroyRef = inject(DestroyRef);

  stakeholderId: string = null;
  newsItems: NewsWrapped[] = [];
  loading: boolean = true;

  ngOnInit(): void {
    this.route.params.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(params => {
      this.stakeholderId = params['id'];
      if (this.stakeholderId) {
        this.fetchNews();
      }
    });
  }

  fetchNews() {
    this.loading = true;
    this.stakeholderNewsService.getStakeholderNews(this.stakeholderId).subscribe({
      next: (res: NewsResponse) => {
        this.newsItems = res.results;
        this.loading = false;
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
