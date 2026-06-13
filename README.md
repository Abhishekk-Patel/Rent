#Requirement:- Angular@15 Node@18

# Rent

This project was generated with [Angular CLI](https://github.com/angular/angular-cli) version 15.2.11.

## Development server

Run `ng serve` for a dev server. Navigate to `http://localhost:4200/`. The application will automatically reload if you change any of the source files.

## Code scaffolding

Run `ng generate component component-name` to generate a new component. You can also use `ng generate directive|pipe|service|class|guard|interface|enum|module`.

## Build

Run `ng build` to build the project. The build artifacts will be stored in the `dist/` directory.

## Running unit tests

Run `ng test` to execute the unit tests via [Karma](https://karma-runner.github.io).

## Running end-to-end tests

Run `ng e2e` to execute the end-to-end tests via a platform of your choice. To use this command, you need to first add a package that implements end-to-end testing capabilities.


## How to Access the Hosted Application

Your application is now hosted on your custom domain:

```
https://www.tryrentit.in/
```

### Build and Deploy Steps

1. Build the project for production:
   ```sh
    ng build --configuration production --output-path docs --base-href ./
   ```

2. Commit and push the contents of the `docs` folder to the `develop` branch:
   ```sh
   git add docs
   git commit -m "Rebuild docs for deployment"
   git push origin develop
   ```

3. GitHub Pages will automatically deploy from the `docs` folder on the `develop` branch.

## Verify the Deployment

1. Open your web browser and navigate to:
   ```
   https://www.tryrentit.in/
   ```

2. Check for Issues:
   - Ensure that all the routes in your Angular application are working correctly.
   - Verify that all assets (images, styles, scripts) are loading properly.

3. Troubleshooting:
   If you encounter any issues, here are some common troubleshooting steps:
   - **404 Errors:** Ensure that the `baseHref` is correctly set to `/` in your `angular.json` file and that `404.html` exists in the `docs` folder.
   - **Caching Issues:** Clear your browser cache or try accessing the site in an incognito window.
   - **Console Errors:** Open the browser's developer console (F12) and check for any errors or warnings.
   - **Google Login Issues:** If you see an `origin_mismatch` error, make sure your custom domain is added as an authorized JavaScript origin in your Google Cloud Console.

4. Update README.md:
   Make sure your README file has the correct URL for accessing the hosted application.

## Further help

To get more help on the Angular CLI use `ng help` or go check out the [Angular CLI Overview and Command Reference](https://angular.io/cli) page.

## Additional Information

For more details on Angular deployment, refer to the [Angular Deployment Guide](https://angular.io/guide/deployment).
