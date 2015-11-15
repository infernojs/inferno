import destroyFragment from './destroyFragment';

export default function insertFragment(context, fragment, parent, container, nextFragment, replace) {
    if (nextFragment) {
        let noDestroy = false;
        let domNextFragment = nextFragment.dom;

        if (!domNextFragment) {
            domNextFragment = nextFragment;
            parent = domNextFragment.parentNode;
            noDestroy = true;
        }

        if (replace) {
            if (noDestroy === false) {
                destroyFragment(fragment, nextFragment);
            }
            parent.replaceChild(container, domNextFragment);
            return;
        }
        parent.insertBefore(container, domNextFragment);

    } else {
        parent.appendChild(container);
    }
}