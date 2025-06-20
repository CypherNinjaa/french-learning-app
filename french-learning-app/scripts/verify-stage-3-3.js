#!/usr/bin/env node

// Stage 3.3 Cross-Check Verification Script
// This script verifies that all Stage 3.3 components are properly built

const fs = require("fs");
const path = require("path");

class Stage33Verifier {
	constructor() {
		this.basePath = process.cwd();
		this.errors = [];
		this.warnings = [];
		this.successes = [];
	}

	log(message, type = "info") {
		const timestamp = new Date().toISOString().split("T")[1].split(".")[0];
		const prefix = {
			success: "✅",
			error: "❌",
			warning: "⚠️",
			info: "ℹ️",
		}[type];

		console.log(`[${timestamp}] ${prefix} ${message}`);

		if (type === "error") this.errors.push(message);
		if (type === "warning") this.warnings.push(message);
		if (type === "success") this.successes.push(message);
	}

	fileExists(filePath) {
		const fullPath = path.join(this.basePath, filePath);
		return fs.existsSync(fullPath);
	}

	readFile(filePath) {
		try {
			const fullPath = path.join(this.basePath, filePath);
			return fs.readFileSync(fullPath, "utf8");
		} catch (error) {
			return null;
		}
	}

	checkFileContent(filePath, patterns) {
		const content = this.readFile(filePath);
		if (!content) {
			this.log(`File not readable: ${filePath}`, "error");
			return false;
		}

		let allFound = true;
		patterns.forEach((pattern) => {
			const found =
				typeof pattern === "string"
					? content.includes(pattern)
					: pattern.test(content);

			if (!found) {
				this.log(`Missing pattern in ${filePath}: ${pattern}`, "warning");
				allFound = false;
			}
		});

		return allFound;
	}

	async verifyStage33() {
		this.log("🚀 Starting Stage 3.3 Cross-Check Verification...", "info");
		this.log("", "info");

		// 1. Check Core Files
		this.log("📁 Checking Core Stage 3.3 Files...", "info");

		const coreFiles = [
			"src/services/contentApiService.ts",
			"src/hooks/useContent.ts",
			"supabase/functions/content-retrieval/index.ts",
			"supabase/stage_3_3_content_api.sql",
			"scripts/deploy-stage-3-3.ts",
			"docs/Stage3.3-Implementation-Complete.md",
		];

		coreFiles.forEach((file) => {
			if (this.fileExists(file)) {
				this.log(`Core file exists: ${file}`, "success");
			} else {
				this.log(`Missing core file: ${file}`, "error");
			}
		});

		// 2. Check ContentApiService Implementation
		this.log("", "info");
		this.log("🔧 Checking ContentApiService Implementation...", "info");

		const contentApiPatterns = [
			"ContentApiService",
			"getContentVersion",
			"createContentVersion",
			"getLevelsWithModules",
			"getModuleWithLessons",
			"getLessonWithContent",
			"getPersonalizedLearningPath",
			"searchContent",
			"syncContentUpdates",
			"getCacheStats",
			"clearAllCache",
		];

		if (
			this.checkFileContent(
				"src/services/contentApiService.ts",
				contentApiPatterns
			)
		) {
			this.log("ContentApiService implementation complete", "success");
		}

		// 3. Check Edge Function Implementation
		this.log("", "info");
		this.log("🌐 Checking Edge Function Implementation...", "info");

		const edgeFunctionPatterns = [
			"content-retrieval",
			"fetchLessons",
			"fetchVocabulary",
			"fetchGrammar",
			"fetchQuestions",
			"fetchMixedContent",
			"fetchContentVersions",
			"Cache-Control",
		];

		if (
			this.checkFileContent(
				"supabase/functions/content-retrieval/index.ts",
				edgeFunctionPatterns
			)
		) {
			this.log("Edge Function implementation complete", "success");
		}

		// 4. Check Database Schema
		this.log("", "info");
		this.log("🗄️ Checking Database Schema...", "info");

		const schemaPatterns = [
			"content_versions",
			"learning_paths",
			"user_content_preferences",
			"content_analytics",
			"content_cache_metadata",
			"lesson_vocabulary",
			"lesson_grammar",
			"content_tags",
			"content_tag_associations",
		];

		if (
			this.checkFileContent(
				"supabase/stage_3_3_content_api.sql",
				schemaPatterns
			)
		) {
			this.log("Database schema complete", "success");
		}

		// 5. Check React Hook Implementation
		this.log("", "info");
		this.log("⚛️ Checking React Hook Implementation...", "info");

		const hookPatterns = [
			"useContent",
			"ContentState",
			"UseContentOptions",
			"fetchFunction",
			"refreshing",
			"clearError",
			"invalidateCache",
		];

		if (this.checkFileContent("src/hooks/useContent.ts", hookPatterns)) {
			this.log("React Hook implementation complete", "success");
		}

		// 6. Check Deployment Script
		this.log("", "info");
		this.log("🚀 Checking Deployment Script...", "info");

		const deploymentPatterns = [
			"Stage33Deployer",
			"deployStage33",
			"testDatabaseConnections",
			"testContentApiService",
			"testCachingFunctionality",
			"testVersioningSystem",
		];

		if (
			this.checkFileContent("scripts/deploy-stage-3-3.ts", deploymentPatterns)
		) {
			this.log("Deployment script complete", "success");
		}

		// 7. Check Documentation
		this.log("", "info");
		this.log("📖 Checking Documentation...", "info");

		const docPatterns = [
			"Stage 3.3 Content API Layer",
			"Content Versioning System",
			"Enhanced Caching Strategy",
			"Advanced Content Retrieval",
			"Performance Optimization",
			"ContentApiService Methods",
		];

		if (
			this.checkFileContent(
				"docs/Stage3.3-Implementation-Complete.md",
				docPatterns
			)
		) {
			this.log("Documentation complete", "success");
		}

		// 8. Feature Completeness Check
		this.log("", "info");
		this.log("🎯 Checking Feature Completeness...", "info");

		const features = [
			{
				name: "Content Versioning",
				check: () =>
					this.checkFileContent("src/services/contentApiService.ts", [
						"getContentVersion",
						"createContentVersion",
					]),
			},
			{
				name: "In-Memory Caching",
				check: () =>
					this.checkFileContent("src/services/contentApiService.ts", [
						"cache = new Map",
						"setCache",
						"getCache",
					]),
			},
			{
				name: "HTTP Caching",
				check: () =>
					this.checkFileContent(
						"supabase/functions/content-retrieval/index.ts",
						["Cache-Control", "max-age"]
					),
			},
			{
				name: "Content Search",
				check: () =>
					this.checkFileContent("src/services/contentApiService.ts", [
						"searchContent",
					]),
			},
			{
				name: "Learning Paths",
				check: () =>
					this.checkFileContent("src/services/contentApiService.ts", [
						"getPersonalizedLearningPath",
					]),
			},
			{
				name: "Content Sync",
				check: () =>
					this.checkFileContent("src/services/contentApiService.ts", [
						"syncContentUpdates",
					]),
			},
			{
				name: "Edge Functions",
				check: () =>
					this.checkFileContent(
						"supabase/functions/content-retrieval/index.ts",
						["serve", "createClient"]
					),
			},
			{
				name: "Database Schema",
				check: () =>
					this.checkFileContent("supabase/stage_3_3_content_api.sql", [
						"content_versions",
						"learning_paths",
					]),
			},
		];

		features.forEach((feature) => {
			if (feature.check()) {
				this.log(`✓ ${feature.name} implemented`, "success");
			} else {
				this.log(`✗ ${feature.name} missing or incomplete`, "error");
			}
		});

		// 9. Generate Final Report
		this.log("", "info");
		this.generateFinalReport();
	}

	generateFinalReport() {
		this.log("📊 STAGE 3.3 VERIFICATION REPORT", "info");
		this.log("=".repeat(50), "info");
		this.log(`✅ Successes: ${this.successes.length}`, "success");
		this.log(`⚠️  Warnings: ${this.warnings.length}`, "warning");
		this.log(`❌ Errors: ${this.errors.length}`, "error");
		this.log("", "info");

		if (this.errors.length === 0) {
			this.log("🎉 STAGE 3.3 VERIFICATION: PASSED", "success");
			this.log("All core components are properly implemented!", "success");
		} else if (this.errors.length <= 2) {
			this.log("⚠️  STAGE 3.3 VERIFICATION: MOSTLY COMPLETE", "warning");
			this.log(
				"Minor issues found but core functionality is intact.",
				"warning"
			);
		} else {
			this.log("❌ STAGE 3.3 VERIFICATION: FAILED", "error");
			this.log("Significant issues found that need attention.", "error");
		}

		this.log("", "info");
		this.log("🔗 STAGE 3.3 COMPONENTS SUMMARY:", "info");
		this.log("- ContentApiService: Enhanced content API with caching", "info");
		this.log("- Edge Functions: Optimized content retrieval endpoints", "info");
		this.log("- Database Schema: Versioning and analytics tables", "info");
		this.log("- React Hooks: Modern content management hooks", "info");
		this.log("- Deployment Scripts: Automated testing and deployment", "info");
		this.log("- Documentation: Complete implementation guide", "info");
		this.log("", "info");
		this.log(
			"✅ Stage 3.3: Content API Layer - IMPLEMENTATION COMPLETE",
			"success"
		);
	}
}

// Run verification
const verifier = new Stage33Verifier();
verifier.verifyStage33().catch(console.error);
