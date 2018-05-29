function isBalanced(str) {
    const balancer = /({(?:(.|\n)(?!{))*?}){1,}/g;
    let source = str.toString();
    while(balancer.test(source)) {
        source = source.replace(balancer, 'replaced');
    }
    return source.indexOf('{') === -1 && source.indexOf('}') === -1;
}

exports.balancer = {
    isBalanced
};
