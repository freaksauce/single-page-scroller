import React, { Component } from 'react'
import PropTypes from 'prop-types'
import scrollIt from './vendor/scrollIt'
import Page from './Page'

class PageScroller extends Component {
  constructor(props) {
    super(props)
    this.state = {
      counter: 1,
      currentElementId: '',
      visiblePagesArr: []
    }
    this.goToPage = this.goToPage.bind(this)
  }

  componentWillReceiveProps(newProps) {
    const updatedPagesLength = newProps.children.length
    const currentLength = this.props.children.length
    if (updatedPagesLength < currentLength) {
      this.setState({
        counter: updatedPagesLength,
        visiblePagesArr: [`P${updatedPagesLength}`]
      })
    }
  }

  /**
   * Force animate to a specific page without seeing any other pages animate, this is possible due to all questions being unmounted on complete
   */
  goToPage(elementId, direction) {
    this.setState({ visiblePagesArr: this.updatedVisiblePagesArr(elementId) }, () => {
      // Scroll to next page
      const el = document.getElementById(this.state.currentElementId)
      if (direction === 'back') {
        const offset = el.clientHeight
        window.scroll(0, offset)
      }
      this.animatePage(elementId, direction)
    })
  }

  updatedVisiblePagesArr(elementId) {
    const visiblePagesArr = this.state.visiblePagesArr
    // if not null add the page ID to the array and return
    if (elementId !== null) return [...visiblePagesArr, elementId]
    return false
  }

  removeFromVisiblePagesArray(elementId) {
    const visiblePagesArr = this.state.visiblePagesArr
    const newVisiblePagesArr = visiblePagesArr.filter(pageId => {
      return pageId !== elementId
    })
    this.setState({ visiblePagesArr: newVisiblePagesArr })
  }

  animatePage(elementId, direction) {
    const {
      onAnimationStart,
      onAnimationEnd
    } = this.props
    const questionsArrDom = document.querySelectorAll('.PageScroller__page')
    const scrollTo = document.getElementById(elementId)
    onAnimationStart()
    scrollIt(scrollTo, 500, 'easeOutQuad', () => {
      // delete current from visible array
      this.removeFromVisiblePagesArray(this.state.currentElementId)
      this.setState({ currentElementId: elementId })
      let isLastPage
      const lastElementId = questionsArrDom[questionsArrDom.length - 1].id
      if (elementId === lastElementId) {
        isLastPage = true
      } else {
        isLastPage = false
      }
      onAnimationEnd(isLastPage, direction)
    }, this.props.offsetTop)
  }

  render() {
    const styles = {
      marginTop: `${this.props.offsetTop}px`
    }
    const { children } = this.props
    return (
      <div className="PageScroller" style={styles}>
        {React.Children.map(children, (PageComponent, index) => {
          const pageIdProp = PageComponent.props.pageId
          const pageId = (pageIdProp !== undefined) ? pageIdProp : `P${index + 1}`
          if (index === 0 && this.state.currentElementId === '') {
            this.state.currentElementId = pageId
            this.state.visiblePagesArr = [pageId]
          }
          const isVisible = !!this.state.visiblePagesArr.includes(pageId)
          return (
            <Page
              id={pageId}
              key={pageId}
              visible={isVisible}
              offsetTop={this.props.offsetTop}
              goToPage={(elementId, direction) => this.goToPage(elementId, direction)}
            >
              {PageComponent}
            </Page>
          )
        })}
      </div>
    )
  }
}

PageScroller.defaultProps = {
  offsetTop: 0
}
PageScroller.propTypes = {
  children: PropTypes.arrayOf(PropTypes.object).isRequired,
  offsetTop: PropTypes.number,
  onAnimationStart: PropTypes.func.isRequired,
  onAnimationEnd: PropTypes.func.isRequired
}

export default PageScroller
