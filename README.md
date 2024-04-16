# GoodX Assesent (v1.1.0)

Application which can be used by medical staff (e.g. a doctor or nurse) to get a summary of their daily schedule (diary), as well as perform basic operations on their diary.
 
## Requirements

 - Angular Cli
 - Git

## Installation

```bash
git clone https://github.com/mignonneC1997/goodx.git
cd goodx
```

## Run App

Running app in browser:

```bash
cd WEB
npm install
ionic serve
Navigate to `http://localhost:8100/`
```

## Unit tests

```bash
Run ionic test
```

## Build

```bash
Run
ionic capacitor build android --configuration=staging
ionic capacitor build ios --configuration=staging
ionic capacitor build android --configuration=production
ionic capacitor build ios --configuration=production
ng build --configuration=production                 

```

### Version control

version x.y.z\
x = main version\
y = new features\
z = bug fixes of minor updates

#### Current version

* release 1.1.0

### Release to Main(Master)
Working in ```develop``` branch GIT bash\
```git tag vx.y.z```\
```git push origin vx.y.z```\
```git flow release start vx.y.z```\
```git flow release publish vx.y.z```\
add and commit new version in files package.json files\
```git flow release finish vx.y.z```


### Wiki

```bash
Read about the app on the wiki
```
