git branch -D gh-pages
git checkout -b gh-pages
npm run build
git add docs/
git commit -m 'build'
git push --force
git checkout main
git branch -D gh-pages
