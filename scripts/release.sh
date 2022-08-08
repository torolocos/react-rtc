export PATH=$(npm bin):$PATH

VERSION=`auto version`

## Support for label 'skip-release'
if [ ! -z "$VERSION" ]; then
  ## Publish Package
  npm version $VERSION --workspace=@torolocos/react-rtc
  npm publish --access public --workspace=@torolocos/react-rtc

  ## Update dependencies
  yarn workspace example upgrade @torolocos/react-rtc

  git add **/package.json

  ## Create GitHub Release
  git push --follow-tags --set-upstream origin $branch
fi
