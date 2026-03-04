CREATE TABLE `categories` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`sort_order` integer DEFAULT 0 NOT NULL,
	`created_at` text DEFAULT '(datetime(''now''))' NOT NULL,
	`updated_at` text DEFAULT '(datetime(''now''))' NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `categories_name_unique` ON `categories` (`name`);--> statement-breakpoint
PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_news_items` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`feed_id` integer,
	`title` text NOT NULL,
	`url` text NOT NULL,
	`publication_date` text,
	`source_name` text,
	`is_paywalled` integer DEFAULT false NOT NULL,
	`status` text DEFAULT 'new' NOT NULL,
	`created_at` text DEFAULT '(datetime(''now''))' NOT NULL,
	FOREIGN KEY (`feed_id`) REFERENCES `feeds`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
INSERT INTO `__new_news_items`("id", "feed_id", "title", "url", "publication_date", "source_name", "is_paywalled", "status", "created_at") SELECT "id", "feed_id", "title", "url", "publication_date", "source_name", "is_paywalled", "status", "created_at" FROM `news_items`;--> statement-breakpoint
DROP TABLE `news_items`;--> statement-breakpoint
ALTER TABLE `__new_news_items` RENAME TO `news_items`;--> statement-breakpoint
PRAGMA foreign_keys=ON;--> statement-breakpoint
CREATE UNIQUE INDEX `news_items_url_unique` ON `news_items` (`url`);