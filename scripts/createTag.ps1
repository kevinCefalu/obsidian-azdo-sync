
$tagVersion = gitversion /showvariable FullSemVer;

git tag $tagVersion;

git push --tags;
