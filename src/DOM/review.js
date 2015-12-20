export default function review(domNode, propertyInfo, propName, value) {
    if (!propertyInfo.needReview || 
	   ('' + domNode[propName]) !== ('' + value)) {
        return true;
    }
    return false;
};